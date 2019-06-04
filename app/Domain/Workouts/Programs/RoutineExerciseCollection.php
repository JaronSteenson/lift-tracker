<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Illuminate\Database\Eloquent\Collection;
use LiftTracker\Http\Requests\WorkoutProgramRequest;

class RoutineExerciseCollection extends Collection
{

    public static function createFromWorkoutRequest(WorkoutProgramRequest $request, $programRoutineIndex): self
    {
        $exercises = array_map(static function ($requestExercise) {
            return new RoutineExercise($requestExercise);
        }, $request->getRoutinesExercise($programRoutineIndex));

        return new static($exercises);
    }
}