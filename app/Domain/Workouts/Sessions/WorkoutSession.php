<?php

namespace LiftTracker\Domain\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Http\Requests\WorkoutSessionRequest;
use LiftTracker\Traits\HasUuidTrait;

/**
 * This class/table doesn't link to exercise instead when adding an exercise to a routine
 * it will copy and extend an Exercise.
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
 * @property WorkoutProgramRoutine workoutProgramRoutine
 * @property WorkoutSession[]|Collection sessionExercises
 * @property Carbon createdAt
 * @property Carbon updatedAt
 *
 */
class WorkoutSession extends AbstractModel
{
    use HasUuidTrait;
    use CanBeOwnedByUserTrait;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'name',
        'bodyWeight',
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
        'bodyWeight',
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
        'workoutProgramRoutine.workoutProgram',
    ];

    public static function createFromRoutine(WorkoutProgramRoutine $originRoutine, string $userId, bool $startNow): self
    {
        return DB::transaction(static function () use ($originRoutine, $userId, $startNow) {
            $workoutSession = new static();
            $workoutSession->userId = $userId;
            $workoutSession->workoutProgramRoutineId = $originRoutine->id;
            $workoutSession->name = $originRoutine->name;
            $workoutSession->endedAt = null;

            $startedAt = null;
            if ($startNow) {
                $startedAt = new Carbon();
                $workoutSession->startedAt = $startedAt;
            }

            $workoutSession->save();

            if (count($originRoutine->routineExercises) === 0) {
                // Add a blank single set exercise.
                $routineExercise = new RoutineExercise();
                $routineExercise->name = $workoutSession->name;
                $routineExercise->position = 0;

                $sessionExercise = SessionExercise::createFromRoutineExercise($routineExercise, $workoutSession->id);

                $sessionSet = new SessionSet();
                $sessionSet->sessionExerciseId = $sessionExercise->id;
                $sessionSet->position = 0;

                $sessionSet->save();
            } else {
                $originRoutine->routineExercises->each(
                    static function (RoutineExercise $routineExercise) use ($workoutSession) {
                        SessionExercise::createFromRoutineExercise($routineExercise, $workoutSession->id);
                    }
                );
            }

            if ($startedAt) {
                /** @var SessionExercise $firstExercise */
                $firstExercise = $workoutSession->sessionExercises->first();

                /** @var SessionSet $firstSet */
                $firstSet = $firstExercise->sessionSets->first();

                $firstSet->startedAt = $startedAt;
                $firstSet->save();
            }

            $workoutSession->fresh();
            $workoutSession->workoutProgramRoutine->fresh();
            $workoutSession->workoutProgramRoutine->workoutProgram->fresh();

            return $workoutSession;
        });
    }

    public static function createFromRequest(WorkoutSessionRequest $request): self
    {
        /** @var static $workoutSession */
        $workoutSession = $request->getExistingModel() ?? new static();

        $workoutSession->fill($request->all());

        $workoutProgramRoutineUuid = $request->get('workoutProgramRoutine')['uuid'];

        if ($workoutProgramRoutineUuid) {
            $workoutProgramRoutine = (new WorkoutProgramRoutine())->findByUuid($workoutProgramRoutineUuid);
            $workoutSession->workoutProgramRoutine()->associate($workoutProgramRoutine);
        }

        // Associate the user with the top level entity.
        if (!$workoutSession->exists) {
            $workoutSession->user()->associate($request->user());
        }

        return $workoutSession;
    }

    public function saveExercisesFromRequest(array $sessionExercises): void
    {
        foreach ($sessionExercises as $requestSessionExercise) {
            $sessionExercise = new SessionExercise($requestSessionExercise);
            $sessionExercise->workoutSessionId = $this->id;

            $routineExerciseUuid = $requestSessionExercise['routineExerciseUuid'];
            if ($routineExerciseUuid) {
                $routineExercise = (new RoutineExercise())->findByUuid($routineExerciseUuid);
                $sessionExercise->routineExerciseId = $routineExercise->id;
            }

            $sessionExercise->setSessionSetsFromRequest($requestSessionExercise['sessionSets']);
            $sessionExercise->saveWithChildren();
        }
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

    public function deleteWithChildren(): ?bool
    {
        return DB::transaction(function(): bool {
            $children = $this->sessionExercises();

            $children->each(function (SessionExercise $child) {
                $child->deleteWithChildren();
            });

            return parent::delete();
        });
    }

}
