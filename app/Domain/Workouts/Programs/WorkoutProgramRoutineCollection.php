<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Illuminate\Database\Eloquent\Collection;
use LiftTracker\Http\Requests\WorkoutProgramRequest;

class WorkoutProgramRoutineCollection extends Collection
{

    public static function createFromWorkoutRequest(WorkoutProgramRequest $request): self
    {
        $workoutProgramRoutines = [];

        foreach ($request->getWorkoutProgramRoutines() as $index => $requestWorkoutRoutine) {
            $routine = new WorkoutProgramRoutine($requestWorkoutRoutine);

            $routineExercises = RoutineExerciseCollection::createFromWorkoutRequest($request, $index);

            $routine->associateRoutineExercises($routineExercises);

            $workoutProgramRoutines []= $routine;
        }

        return new static($workoutProgramRoutines);
    }

}