<?php

namespace LiftTracker\Domain\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Http\Requests\WorkoutSessionRequest;
use LiftTracker\Traits\HasUuidTrait;

/**
 * This class/table doesn't link to exercise instead when adding an exercise to a routine
 * it will copy and extend an Exercise.
 *
 * @see Exercise
 *
 * @mixin Builder
 * @property string id
 * @property string uuid
 * @property string sessionExerciseId
 * @property string reps
 * @property Carbon weight
 * @property int restPeriodDuration
 * @property Carbon restPeriodStartedAt
 * @property Carbon restPeriodEndedAt
 * @property int position
 * @property Carbon createdAt
 * @property Carbon updatedAt
 *
 */
class SessionSet extends AbstractModel
{
    use HasUuidTrait;
    use CanBeOwnedByUserTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'sessionExerciseId',
        'routineExerciseId',
        'reps',
        'weight',
        'restPeriodDuration',
        'restPeriodStartedAt',
        'restPeriodEndedAt',
        'position',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'sessionExerciseId',
        'routineExerciseId',
        'reps',
        'weight',
        'restPeriodDuration',
        'restPeriodStartedAt',
        'restPeriodEndedAt',
        'position',
    ];

    protected $casts = [
        'reps' => 'integer',
        'weight' => 'integer',
        'restPeriodDuration' => 'integer',
        'restPeriodStartedAt' => 'date',
        'restPeriodEndedAt' => 'date',
        'position' => 'integer',
    ];

    public static function createFromRequest(WorkoutSessionRequest $request): self
    {
//        /** @var static $workoutProgram */
//        $workoutProgram = $request->getExistingModel() ?? new static();
//
//        $workoutProgram->name = $request->get('name');
//
//        // Associate the user with the top level entity.
//        if (!$workoutProgram->exists) {
//            $workoutProgram->user()->associate($request->user());
//        }
//
//        return $workoutProgram;
    }

}
