<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use RuntimeException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Traits\CanUseCustomCollection;
use LiftTracker\Traits\HasUuidTrait;
use LiftTracker\User;
use Traversable;

/**
 * @mixin Builder
 * @property string id Is a UUID
 * @property string workoutProgramId Is a UUID
 * @property string name
 * @property string normalDay
 * @property Carbon createdAt
 * @property Carbon updatedAt
 * @property RoutineExerciseCollection exercises
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
        'exercises',
        'workoutProgramId',
    ];

    protected $with = [
        'exercises',
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

    public function exercises(): HasMany
    {
        return $this->hasMany(RoutineExercise::class);
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

        $this->exercises()->saveMany($routineExercises);

        $this->setRelation('exercises', new RoutineExerciseCollection($routineExercises));

        return $this;
    }


    public function associateRoutineExercises(RoutineExerciseCollection $routineExercises): self
    {
        $this->setRelation('exercises', $routineExercises);

        return $this;
    }

    public function saveExercises()
    {
        $exercises = $this->exercises;

        $exercises->each(function (RoutineExercise $exercises) {
            $exercises->workoutProgramRoutineId = $this->id;
        });

        $this->exercises()->saveMany($exercises);

        return $this;
    }
}
