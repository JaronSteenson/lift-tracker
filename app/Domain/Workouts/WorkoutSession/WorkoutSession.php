<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
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
 * @property string workoutProgramRoutineId
 * @property string name
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property int numberOfSets
 * @property int weight in kg
 * @property int restPeriod in seconds
 * @property int position
 *
 */
class WorkoutSession extends AbstractModel
{
    use HasUuidTrait;
    use CanBeOwnedByUserTrait;

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
    ];

    public static function createFromRoutine(WorkoutProgramRoutine $originRoutine)
    {
//        TODO jaron
        return new static();
    }

    public static function createFromRequest(WorkoutSessionRequest $request): self
    {
        /** @var static $workoutProgram */
        $workoutProgram = $request->getExistingModel() ?? new static();

        $workoutProgram->name = $request->get('name');

        // Associate the user with the top level entity.
        if (!$workoutProgram->exists) {
            $workoutProgram->user()->associate($request->user());
        }

        return $workoutProgram;
    }

    public function routine(): BelongsTo
    {
        return $this->belongsTo(WorkoutProgramRoutine::class, 'workoutProgramRoutineId');
    }

}
