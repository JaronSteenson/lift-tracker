<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Traits\HasCamelCaseTimeStampColumns;
use LiftTracker\Traits\HasCustomCollection;
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
class WorkoutProgramRoutine extends Model implements UserOwnershipInterface
{
    use HasUUID;
    use HasCustomCollection;

    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'WorkoutProgramRoutines';

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
        return $this->belongsTo(WorkoutProgram::class);
    }

    public function userOwnsThis(User $user): bool
    {
        /** @var WorkoutProgram $parentWorkoutProgram */
        $parentWorkoutProgram = $this->workoutProgram()->get()->first();

        return $parentWorkoutProgram && $parentWorkoutProgram->user_id === $user->id;
    }
}
