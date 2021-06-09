<?php

namespace LiftTracker\Domain;

use Illuminate\Support\Facades\Auth;

class AppBootstrapData implements \JsonSerializable
{

    /**
     * @inheritDoc
     */
    public function jsonSerialize(): array
    {
        return [
            'authenticatedUser' => Auth::user(),
            'appName' => config('app.name'),
            'csrfToken' => csrf_token(),
            'facebookAppId' => config('app.facebook_app_id'),
        ];
    }
}
