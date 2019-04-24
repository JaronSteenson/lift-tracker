<?php

namespace LiftTracker\Http\Requests;

use LiftTracker\Rules\DayOfTheWeek;

class WorkoutProgramRequest extends ApiRequest
{
    protected function getValidationRules(): array
    {
        return [
            'name' => 'required|max:40',

            'workoutRoutines.*.name' => 'required|max:40',
            'workoutRoutines.*.day' => ['required', new DayOfTheWeek()],

            'workoutRoutines.*.exercises.*.numberOfSets' => 'numeric|min:1|max:12',

            'workoutRoutines.*.exercises.*.exercise.id' => 'uuid|required',
        ];
    }
}