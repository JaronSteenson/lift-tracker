<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use LiftTracker\Http\Requests\WorkoutProgramRequest;

class RoutineExerciseCollection extends Collection
{

    public static function createFromWorkoutRequest(WorkoutProgramRequest $request, $programRoutineIndex): self
    {
        $exercises = array_map(static function (array $requestExercise) use ($request) {
            $exercise =  new RoutineExercise($requestExercise);

            if ($request->method() === 'PUT') {
                $exercise->id = Arr::get($requestExercise, 'id');
            }

            return $exercise;
        }, $request->getRoutinesExercise($programRoutineIndex));

        return new static($exercises);
    }
}
