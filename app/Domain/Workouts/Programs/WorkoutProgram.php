<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

        // Associate the user with the top level entity.
        $workoutProgram->user()->associate($request->user());

        // Associate the workoutProgramRoutines (first level child).
        $routines = WorkoutProgramRoutineCollection::createFromWorkoutRequest($request);
        $workoutProgram->associateProgramRoutines($routines);

        return $workoutProgram;
    }

    public function saveWithChildren()
    {

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

    /**
     * Save and attach in memory many workout program routines.
     *
     * @param WorkoutProgramRoutine ...$programRoutines
     * @return $this
     */
    public function saveManyProgramRoutines(WorkoutProgramRoutine ...$programRoutines): self
    {
        foreach ($programRoutines as $routine) {
            $routine->workoutProgramId = $this->id;
        }

        $this->workoutProgramRoutines()->saveMany($programRoutines);

        $this->setRelation('workoutProgramRoutines', new WorkoutProgramRoutineCollection($programRoutines));

        return $this;
    }

    protected function associateProgramRoutines(WorkoutProgramRoutineCollection $programRoutines): self
    {
        $this->setRelation('workoutProgramRoutines', $programRoutines);

        return $this;
    }

}
