<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
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
 * @property string workoutProgramRoutineId
 * @property string name
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property int numberOfSets
 * @property int weight in kg
 * @property int restPeriod in seconds
 * @property int position
 * @property carbon|null deletedAt
 *
 */
class RoutineExercise extends AbstractModel
{
    use HasUuidTrait;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'numberOfSets',
        'position',
        'weight',
        'restPeriod',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'name',
        'numberOfSets',
        'position',
        'weight',
        'restPeriod',
    ];

    protected $casts = [
        'numberOfSets' => 'integer',
        'weight' => 'integer',
        'restPeriod' => 'integer',
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    public function routine(): BelongsTo
    {
        return $this->belongsTo(WorkoutProgramRoutine::class, 'workoutProgramRoutineId');
    }

}
