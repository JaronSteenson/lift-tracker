<?php

namespace LiftTracker\Domain\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
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
 * @property string workoutProgramId
 * @property string userId
 * @property string name
 * @property Carbon startedAt
 * @property Carbon endedAt
 * @property string notes
 * @property WorkoutSession[]|Collection sessionExercises
 * @property Carbon createdAt
 * @property Carbon updatedAt
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
        'uuid',
        'name',
        'startedAt',
        'endedAt',
        'notes',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'name',
        'startedAt',
        'endedAt',
        'notes',
        'sessionExercises',
        'createdAt',
        'updatedAt',
    ];

    protected $casts = [
        'startedAt' => 'datetime:c',
        'endedAt' => 'datetime:c',
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    protected $with = [
        'sessionExercises',
    ];

    public static function createFromRoutine(WorkoutProgramRoutine $originRoutine, string $userId, bool $startNow): self
    {
        return DB::transaction(static function () use ($originRoutine, $userId, $startNow) {
            $workoutSession = new static();
            $workoutSession->userId = $userId;
            $workoutSession->workoutProgramId = $originRoutine->id;
            $workoutSession->name = $originRoutine->name;

            if ($startNow) {
                $workoutSession->startedAt = new Carbon();
            }

            $workoutSession->save();

            $originRoutine->routineExercises->each(
                    static function (RoutineExercise $routineExercise) use ($workoutSession) {
                        SessionExercise::createFromRoutineExercise($routineExercise, $workoutSession->id);
                }
            );

            return $workoutSession->fresh();
        });
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

    public function findBySet(string $setUuid): ?self
    {
        /** @var SessionSet $routine */
        $sessionSet = (new SessionSet())->findByUUid($setUuid);

        if ($sessionSet === null) {
            return null;
        }

        $exercise = $sessionSet->sessionExercise;

        if ($exercise === null) {
            return null;
        }

        return $exercise->workoutSession;
    }

    public function sessionExercises(): HasMany
    {
        return $this->hasMany(SessionExercise::class, 'workoutSessionId');
    }

}
