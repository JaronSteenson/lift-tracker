<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use RuntimeException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Traits\CanUseCustomCollection;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;

/**
 * @mixin Builder
 * @property string id Is a UUID
 * @property string workoutProgramId Is a UUID
 * @property string name
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property RoutineExerciseCollection $routineExercises
 *
 */
class WorkoutProgramRoutine extends AbstractModel implements UserOwnershipInterface
{
    use HasUuidTrait;
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
        'routineExercises',
        'workoutProgramId',
    ];

    protected $with = [
        'routineExercises',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string', //is a uuid
    ];

    public static function boot() {
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

    public function userOwnsThis(User $user): bool
    {
        /** @var WorkoutProgram $parentWorkoutProgram */
        $parentWorkoutProgram = $this->workoutProgram()->get()->first();

        return $parentWorkoutProgram && $parentWorkoutProgram->userId === $user->id;
    }

    public function routineExercises(): HasMany
    {
        return $this->hasMany(RoutineExercise::class);
    }

    public function setRoutineExercises(RoutineExerciseCollection $exercises)
    {
        return $this->setRelation('routineExercises', $exercises);
    }

    /**
     * Save and attach in memory many workout program routines.
     *
     * @param RoutineExercise[] $routineExercises
     * @return $this
     */
    public function saveManyRoutineExercises(RoutineExercise ...$routineExercises): self
    {
        if ($this->id === null) {
            throw new RuntimeException('Cannot save many routine exercises until this WorkoutProgramRoutine has an id (has been saved)');
        }

        foreach ($routineExercises as $routine) {
            $routine->workoutProgramRoutineId = $this->id;
        }

        $this->routineExercises()->saveMany($routineExercises);

        $this->setRelation('routineExercises', new RoutineExerciseCollection($routineExercises));

        return $this;
    }


    public function associateExercises(RoutineExerciseCollection $routineExercises): self
    {
        $this->setRelation('exercises', $routineExercises);

        return $this;
    }

    public function saveExercises()
    {
        $this->routineExercises->each(function (RoutineExercise $exercises) {
            $exercises->workoutProgramRoutineId = $this->id;
        });

        $this->deleteRemovedChildren('routineExercises');
        $this->routineExercises()->saveMany($this->routineExercises);

        return $this;
    }

}
