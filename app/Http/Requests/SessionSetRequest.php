<?php

namespace LiftTracker\Http\Requests;

use LiftTracker\Domain\Workouts\Sessions\SessionSet;

class SessionSetRequest extends ApiRequest
{

    protected function getModelClass(): string
    {
        return SessionSet::class;
    }

}
