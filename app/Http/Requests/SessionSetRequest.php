<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;

class SessionSetRequest extends ApiRequest
{

    protected function getModelClass(): string
    {
        return SessionSet::class;
    }

}
