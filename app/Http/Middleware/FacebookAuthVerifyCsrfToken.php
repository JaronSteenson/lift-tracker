<?php

namespace LiftTracker\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class FacebookAuthVerifyCsrfToken extends VerifyCsrfToken
{

    protected function isReading($request): bool
    {
        // Facebook auth redirect comes in as a get request, but we still want to check the csrf token.
        return false;
    }

    /**
     * @inheritDoc
     */
    protected function getTokenFromRequest($request)
    {
        return $request->get('csrf-token');
    }

}
