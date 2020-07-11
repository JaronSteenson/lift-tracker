<?php

namespace LiftTracker\Domain\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
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
 * @property Carbon startedAt
 * @property Carbon endedAt
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property SessionExercise sessionExercise
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
        'startedAt',
        'endedAt',
        'position',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'reps',
        'weight',
        'restPeriodDuration',
        'restPeriodStartedAt',
        'restPeriodEndedAt',
        'position',
        'startedAt',
        'endedAt',
        'createdAt',
        'updatedAt',
    ];

    protected $casts = [
        'reps' => 'integer',
        'weight' => 'integer',
        'restPeriodDuration' => 'integer',
        'restPeriodStartedAt' => 'datetime:c',
        'restPeriodEndedAt' => 'datetime:c',
        'position' => 'integer',
        'startedAt' => 'datetime:c',
        'endedAt' => 'datetime:c',
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    public function sessionExercise(): BelongsTo
    {
        return $this->belongsTo(SessionExercise::class, 'sessionExerciseId');
    }

}
