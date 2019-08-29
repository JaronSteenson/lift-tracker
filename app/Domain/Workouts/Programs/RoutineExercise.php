<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Traits\CanUseCustomCollection;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;

/**
 * This class/table doesn't link to exercise instead when adding an exercise to a routine
 * it will copy and extend an Exercise.
 *
 * @see Exercise
 *
 * @mixin Builder
 * @property string id Is a UUID
 * @property string workoutProgramRoutineId Is a UUID
 * @property string name
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property int numberOfSets
 *
 */
class RoutineExercise extends AbstractModel
{
    use HasUuidTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'numberOfSets',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'id',
        'name',
        'numberOfSets',
        'workoutProgramRoutineId',
    ];

    public function routine(): BelongsTo
    {
        return $this->belongsTo(WorkoutProgramRoutine::class);
    }

}
