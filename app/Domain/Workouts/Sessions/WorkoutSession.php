<?php

namespace LiftTracker\Domain\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
 * @property int workoutProgramRoutineId
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
        'workoutProgramRoutine'
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
            $workoutSession->workoutProgramRoutineId = $originRoutine->id;
            $workoutSession->name = $originRoutine->name;

            $startedAt = null;
            if ($startNow) {
                $startedAt = new Carbon();
                $workoutSession->startedAt = $startedAt;
            }

            $workoutSession->save();

            $originRoutine->routineExercises->each(
                    static function (RoutineExercise $routineExercise) use ($workoutSession) {
                        SessionExercise::createFromRoutineExercise($routineExercise, $workoutSession->id);
                }
            );

            if ($startedAt) {
                /** @var SessionExercise $firstExercise */
                $firstExercise = $workoutSession->sessionExercises->first();

                /** @var SessionSet $firstSet */
                $firstSet = $firstExercise->sessionSets->first();

                $firstSet->startedAt = $startedAt;
                $firstSet->save();
            }

            return $workoutSession->fresh();
        });
    }

    public static function createFromRequest(WorkoutSessionRequest $request): self
    {
        /** @var static $workoutSession */
        $workoutSession = $request->getExistingModel() ?? new static();

        $workoutSession->fill($request->all());

        // Associate the user with the top level entity.
        if (!$workoutSession->exists) {
            $workoutSession->user()->associate($request->user());
        }

        return $workoutSession;
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

    /**
     * Find workouts that have been started but not finished.
     * Any workout started over 24 hours ago is considered finished.
     *
     * @param int $userId
     * @return Collection|WorkoutSession[]
     */
    public function findInProgress(int $userId)
    {
        return $this->whereNull('endedAt')
            ->where('startedAt', '>=', Carbon::now()->modify('-24 hour'))
            ->where('userId', $userId)
            ->orderBy('createdAt', 'desc')
            ->get();
    }

    public function sessionExercises(): HasMany
    {
        return $this->hasMany(SessionExercise::class, 'workoutSessionId');
    }

    public function workoutProgramRoutine(): BelongsTo
    {
        return $this->BelongsTo(WorkoutProgramRoutine::class, 'workoutProgramRoutineId');
    }

}
