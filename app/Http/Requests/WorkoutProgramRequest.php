<?php

namespace LiftTracker\Http\Requests;

class WorkoutProgramRequest extends ApiRequest
{
    protected function getValidationRules(): array
    {
        return [
            'name' => 'required|max:40',
            'workoutRoutines.*.id' => 'required|digits',
        ];
    }
}