<?php

namespace LiftTracker\Http\Requests;

use LiftTracker\Domain\Workouts\Sessions\SessionExercise;

class SessionExerciseRequest extends ApiRequest
{

    protected function getModelClass(): string
    {
        return SessionExercise::class;
    }

}
