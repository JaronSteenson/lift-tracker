<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;

/**
 * @mixin Builder
 * @property string id Is a UUID
 * @property string workoutProgramId Is a UUID
 * @property string name
 * @property int position
 * @property string userId
 * @property WorkoutProgram workoutProgram
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property Collection|RoutineExercise[] $routineExercises
 *
 */
class WorkoutProgramRoutine extends AbstractModel implements UserOwnershipInterface
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
        'name',
        'normalDay',
        'position',
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'uuid',
        'name',
        'normalDay',
        'routineExercises',
        'position',
        'workoutProgram',
    ];

    protected $casts = [
        'createdAt' => 'datetime:c',
        'updatedAt' => 'datetime:c',
    ];

    public static function boot(): void
    {
        parent::boot();

        static::deleting(static function(WorkoutProgramRoutine $routine) {
            // Delete exercises also on delete.
            $routine->routineExercises()->delete();
        });
    }

    public function workoutProgram(): BelongsTo
    {
        return $this->belongsTo(WorkoutProgram::class, 'workoutProgramId');
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->workoutProgram !== null && $this->workoutProgram->userId === $user->id;
    }

    public function routineExercises(): HasMany
    {
        return $this->hasMany(RoutineExercise::class)->orderBy('position');
    }

    public function setRoutineExercises(Collection $exercises): self
    {
        return $this->setRelation('routineExercises', $exercises);
    }

    public function saveWithExercises()
    {
        return DB::transaction(function() {
            $saveResult = $this->save();

            $this->saveExercises();

            return $saveResult;
        });

    }

    public function saveExercises(): self
    {
        $this->routineExercises->each(function (RoutineExercise $exercises) {
            $exercises->workoutProgramRoutineId = $this->id;
        });

        $this->deleteRemovedChildren('routineExercises');

        foreach ($this->routineExercises as $routineExercise) {
            /** @var RoutineExercise $movedFromDifferentParent */
            $movedFromDifferentParent = RoutineExercise::withTrashed()
                ->where('uuid', $routineExercise->uuid)
                ->where($this->getForeignKey(), '!=', $this->id)
                ->first();

            if ($movedFromDifferentParent !== null) {
                $movedFromDifferentParent->workoutProgramRoutineId = $this->id;
                $movedFromDifferentParent->fill($routineExercise->toArray());
                $movedFromDifferentParent->deletedAt = null;
                $movedFromDifferentParent->save();
            } else {
                $routineExercise->save();
            }
        }

        return $this;
    }

}
