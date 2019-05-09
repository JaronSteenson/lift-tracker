<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LiftTracker\Domain\BaseModel;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Traits\HasCamelCaseTimeStampColumns;
use LiftTracker\Traits\CanUseCustomCollection;
use LiftTracker\Traits\HasUUID;
use LiftTracker\User;

/**
 * @mixin Builder
 * @property string id Is a UUID
 * @property string name
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 *
 */
class WorkoutProgramRoutine extends BaseModel implements UserOwnershipInterface
{
    use HasUUID;
    use CanUseCustomCollection;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'normalDay',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'id',
        'name',
        'normalDay',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string', //is a uuid
    ];

    public function workoutProgram(): BelongsTo
    {
        return $this->belongsTo(WorkoutProgram::class, 'workoutProgramId');
    }

    public function userOwnsThis(User $user): bool
    {
        /** @var WorkoutProgram $parentWorkoutProgram */
        $parentWorkoutProgram = $this->workoutProgram()->get()->first();

        return $parentWorkoutProgram && $parentWorkoutProgram->user_id === $user->id;
    }
}
