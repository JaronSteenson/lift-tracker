<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use LiftTracker\Traits\CanUseCustomCollection;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;

/**
 * @mixin Builder
 * @property string id
 * @property string name
 * @property Carbon created_at
 * @property Carbon updated_at
 * @property int user_id
 * @property WorkoutProgramRoutineCollection workoutProgramRoutines
 *
 * For now these are only admin generated. Will want user generated in the future though.
 */
class WorkoutProgram extends AbstractModel implements UserOwnershipInterface
{
    use HasUuidTrait;
    use CanUseCustomCollection;
    use CanBeOwnedByUserTrait;

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
        'name',
        'id',
        'workoutProgramRoutines',
    ];

    protected $with = [
        'workoutProgramRoutines',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string', //is a uuid
    ];

    public static function createFromRequest(WorkoutProgramRequest $request)
    {
        // Populate the top level fields.
        $workoutProgram = new static($request->getWorkoutProgramFields());

        if ($request->method() === 'PUT') {
            $workoutProgram->id = $request->getWorkoutProgramId();
        }

        // Associate the user with the top level entity.
        $workoutProgram->user()->associate($request->user());

        // Associate the workoutProgramRoutines (first level child).
        $routines = WorkoutProgramRoutineCollection::createFromWorkoutRequest($request);
        $workoutProgram->associateProgramRoutines($routines);

        return $workoutProgram;
    }

    public function saveWithChildren()
    {
        return DB::transaction(function() {
            $this->exists = (bool) $this->id;

            $this->save();
            $this->saveRoutinesWithChildren();

            return $this;
        });
    }

    private function saveRoutinesWithChildren()
    {
        return DB::transaction(function() {
            $routines = $this->workoutProgramRoutines;

            $routines->each(function (WorkoutProgramRoutine $routine) {
                $routine->workoutProgramId = $this->id;
            });

            $this->deleteRemovedRoutines();
            $this->workoutProgramRoutines()->saveMany($routines);

            $routines->each(static function (WorkoutProgramRoutine $routine) {
                $routine->saveExercises();
            });

            return $this;
        });
    }

    private function deleteRemovedRoutines()
    {
        $routinesToBeSaved = $this->workoutProgramRoutines;

        $alreadyPersistedRoutines = $this->workoutProgramRoutines()->get();

        $routinesToBeDeleted = $alreadyPersistedRoutines->diff($routinesToBeSaved);

        $toBeDeletedIds = $routinesToBeDeleted->keys()->toArray();

        if ($toBeDeletedIds) {
            WorkoutProgramRoutine::destroy($toBeDeletedIds);
        }
    }

    /**
     * Get the user that owns the workout program, null if it is a community program.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function workoutProgramRoutines(): HasMany
    {
        return $this->hasMany(WorkoutProgramRoutine::class);
    }

    protected function associateProgramRoutines(WorkoutProgramRoutineCollection $programRoutines): self
    {
        $this->setRelation('workoutProgramRoutines', $programRoutines);

        return $this;
    }

}
