<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;

/**
 * This class/table doesn't link to exercise instead when adding an exercise to a routine
 * it will copy and extend an Exercise.
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
 * @property WorkoutProgramRoutine routine
 *
 */
class RoutineExercise extends AbstractModel implements UserOwnershipInterface
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
        'weight' => 'double',
        'restPeriod' => 'integer',
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    public function routine(): BelongsTo
    {
        return $this->belongsTo(WorkoutProgramRoutine::class, 'workoutProgramRoutineId');
    }

    public function syncWeightFromSessionSet(SessionSet $sessionSet): self
    {
        $this->weight = $sessionSet->weight;
        $this->save();

        return $this;
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->routine->isOwnedBy($user);
    }

    public function isNotOwnedBy(User $user): bool
    {
        return !$this->isOwnedBy($user);
    }
}
