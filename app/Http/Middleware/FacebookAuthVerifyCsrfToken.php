<?php

namespace LiftTracker\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Session\TokenMismatchException;

class FacebookAuthVerifyCsrfToken extends VerifyCsrfToken
{

    public function handle($request, Closure $next)
    {
        if (
            $this->isReading($request) ||
            $this->runningUnitTests() ||
            $this->inExceptArray($request) ||
            $this->tokensMatch($request)
        ) {
            return tap($next($request), function ($response) use ($request) {
                if ($this->shouldAddXsrfTokenCookie()) {
                    $this->addCookieToResponse($request, $response);
                }
            });
        }

        // Just redirect to the home page instead of showing a page expired error.
        return redirect('');
    }

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
