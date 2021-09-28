<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use LiftTracker\Traits\HasUuidTrait;

/**
 * @mixin Builder
 * @property string id
 * @property string name
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property int userId
 * @property Collection|WorkoutProgramRoutine[] workoutProgramRoutines
 *
 * For now these are only admin generated. Will want user generated in the future though.
 */
class WorkoutProgram extends AbstractModel implements UserOwnershipInterface
{
    use HasUuidTrait;
    use CanBeOwnedByUserTrait;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name'
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'name',
        'createdAt',
        'updatedAt',
        'workoutProgramRoutines',
    ];


    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    public static function boot(): void
    {
        parent::boot();

        static::deleting(static function(WorkoutProgram $self) {
            // Child deleting hook is not called if not deleted individually.
            $self->workoutProgramRoutines()->each(function (WorkoutProgramRoutine $child) {
                $child->delete();
            });
        });
    }

    public static function createFromRequest(WorkoutProgramRequest $request): self
    {
        /** @var WorkoutPRogram $workoutProgram */
        $workoutProgram = $request->getExistingModel();

        if ($workoutProgram === null) {
            $workoutProgram = new static();
            $workoutProgram->uuid = $request->get('uuid');
        }

        // Populate the top level fields.
        $workoutProgram->fill($request->getWorkoutProgramFields());

        // Associate the user with the top level entity.
        if (!$workoutProgram->exists) {
            $workoutProgram->user()->associate($request->user());
        }

        // Associate the workoutProgramRoutines (first level child).
        $routines = $request->mergeExistingAndNewWorkoutRoutines();
        $workoutProgram->associateProgramRoutines($routines);

        return $workoutProgram;
    }

    public function findByRoutine(string $routineUuid): ?self
    {
        /** @var WorkoutProgramRoutine $routine */
        $routine = (new WorkoutProgramRoutine())->findByUUid($routineUuid);

        if ($routine === null) {
            return null;
        }

        return $routine->workoutProgram;
    }

    public function saveWithChildren(): self
    {
        return DB::transaction(function() {
            // Always update the timestamps because we display them in the ui.
            $this->touch();
            $this->save();
            $this->saveRoutinesWithExercises();

            return $this;
        });
    }

    private function saveRoutinesWithExercises(): self
    {
        return DB::transaction(function() {
            $this->deleteRemovedChildren('workoutProgramRoutines');
            $this->workoutProgramRoutines()->saveMany($this->workoutProgramRoutines);

            $this->workoutProgramRoutines->each(static function (WorkoutProgramRoutine $routine) {
                $routine->saveExercises();
            });

            return $this;
        });
    }

    public function workoutProgramRoutines(): HasMany
    {
        return $this->hasMany(WorkoutProgramRoutine::class);
    }

    protected function associateProgramRoutines(Collection $programRoutines): self
    {
        $this->setRelation('workoutProgramRoutines', $programRoutines);

        return $this;
    }

}
