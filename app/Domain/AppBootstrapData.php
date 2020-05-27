<?php

namespace LiftTracker\Domain;

use Illuminate\Support\Facades\Auth;

class AppBootstrapData implements \JsonSerializable
{

    /**
     * @inheritDoc
     */
    public function jsonSerialize()
    {
        return [
            'authenticatedUser' => Auth::user(),
            'csrfToken' => csrf_token(),
            'appName' => config('app.name', 'Lift Tracker'),
        ];
    }
}
