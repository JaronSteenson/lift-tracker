<?php

namespace LiftTracker\Domain\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;

/**
 * This class/table doesn't link to exercise instead when adding an exercise to a routine
 * it will copy and extend an Exercise.
 *
 * @mixin Builder
 * @property string id
 * @property string uuid
 * @property string workoutSessionId
 * @property string routineExerciseId
 * @property string name
 * @property Carbon plannedWeight
 * @property string plannedRestPeriodDuration
 * @property string notes
 * @property string position
 * @property SessionSet[]|Collection sessionSets
 * @property WorkoutSession workoutSession
 * @property RoutineExercise routineExercise
 * @property Carbon createdAt
 * @property Carbon updatedAt
 *
 */
class SessionExercise extends AbstractModel implements UserOwnershipInterface
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
        'plannedWeight',
        'plannedRestPeriodDuration',
        'notes',
        'position',
        'skipped',
    ];

    protected $appends = [
        'wasAddedOnTheFly',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'name',
        'plannedWeight',
        'plannedRestPeriodDuration',
        'notes',
        'position',
        'sessionSets',
        'createdAt',
        'updatedAt',
        'wasAddedOnTheFly',
        'skipped',
    ];

    protected $with = [
        'sessionSets',
    ];

    protected $casts = [
        'plannedReps' => 'integer',
        'plannedWeight' => 'integer',
        'plannedRestPeriodDuration' => 'integer',
        'skipped' => 'boolean',
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    protected $touches = [
        'workoutSession'
    ];

    public static function createFromRoutineExercise(
        RoutineExercise $originExercise,
        string $workoutSessionId
    ): self
    {
        return DB::transaction(static function () use ($originExercise, $workoutSessionId) {
            $sessionExercise = new static();
            $sessionExercise->workoutSessionId = $workoutSessionId;
            $sessionExercise->name = $originExercise->name;
            $sessionExercise->plannedWeight = $originExercise->weight;
            $sessionExercise->plannedRestPeriodDuration = $originExercise->restPeriod;
            $sessionExercise->position = $originExercise->position;
            $sessionExercise->routineExerciseId = $originExercise->id;

            $sessionExercise->save();

            for ($i = 0; $i < $originExercise->numberOfSets; $i++) {
                $sessionSet = new SessionSet();
                $sessionSet->weight = $sessionExercise->plannedWeight;
                $sessionSet->sessionExerciseId = $sessionExercise->id;
                $sessionSet->position = $i;

                $sessionSet->save();
            }

            return $sessionExercise->fresh();
        });
    }

    public function getWasAddedOnTheFlyAttribute(): bool
    {
        return $this->routineExerciseId === null;
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->workoutSession->userId === $user->id;
    }

    public function isNotOwnedBy(User $user): bool
    {
        return !$this->isOwnedBy($user);
    }

    public function findPreviousEntries(): Collection
    {
        if ($this->routineExerciseId === null) {
            return new Collection;
        }

        $userId = $this->workoutSession->userId;

        return $this->select('SessionExercises.*')
            ->where('routineExerciseId', $this->routineExerciseId)
            ->join('WorkoutSessions','WorkoutSessions.id','=','workoutSessionId')
            ->where('WorkoutSessions.userId', $userId)
            ->where('SessionExercises.id', '!=', $this->id)
            ->where('SessionExercises.skipped', '=', false)
            ->orderBy('WorkoutSessions.startedAt')
            ->get();
    }

    public function workoutSession(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class, 'workoutSessionId');
    }

    public function routineExercise(): BelongsTo
    {
        return $this->belongsTo(RoutineExercise::class, 'routineExerciseId');
    }

    public function sessionSets(): HasMany
    {
        return $this->hasMany(SessionSet::class, 'sessionExerciseId');
    }

    public function deleteWithChildren(): ?bool
    {
        return DB::transaction(function(): bool {
            $children = $this->sessionSets();

            $children->each(function (SessionSet $child) {
                $child->delete();
            });

            return parent::delete();
        });
    }

    public function setSessionSetsFromRequest(array $setsAttributesArray): self
    {
        $existingSets = $this->sessionSets()->get()->keyBy('uuid');

        // Merge new and existing.
        $mergedSessionSets = collect($setsAttributesArray)->map(function (array $sessionSetFromRequest) use ($existingSets) {
            if ($existingSets->has($sessionSetFromRequest['uuid'])) {
                /** @var SessionSet $existingSet */
                $existingSet = $existingSets->get($sessionSetFromRequest['uuid']);
                $existingSet->fill($sessionSetFromRequest);

                return $existingSet;
            }

            $newSessionSet = new SessionSet($sessionSetFromRequest);
            $newSessionSet->uuid = $sessionSetFromRequest['uuid'];
            return $newSessionSet;
        });

        $this->setRelation('sessionSets', $mergedSessionSets);

        return $this;
    }

    public function saveWithChildren(): self
    {
        return DB::transaction(function(): self {
            $this->save();
            $this->touchOwners();

            $this->saveSets();

            return $this;
        });
    }

    private function saveSets(): self
    {
        return DB::transaction(function() {
            $this->deleteRemovedChildren('sessionSets');
            $this->sessionSets()->saveMany($this->sessionSets);

            $this->refresh();

            return $this;
        });
    }

}
