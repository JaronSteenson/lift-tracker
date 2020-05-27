<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Rules\DayOfTheWeek;
use LiftTracker\Rules\UniquePositions;
use LiftTracker\Rules\Uuid;

class WorkoutSessionRequest extends ApiRequest
{

    protected function getModelClass(): string
    {
        return WorkoutSession::class;
    }

}
