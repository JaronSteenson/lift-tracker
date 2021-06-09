<?php

namespace LiftTracker\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class FacebookAuthParseState
{

    /**
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $extractedState = $this->extractState($request->get('state'));

        return $next($this->updateRequest($request, $extractedState));
    }

    protected function extractState(string $encoded_state): array
    {
        $pairs = explode(',', $encoded_state);

        $keyValues = [];
        foreach ($pairs as $pair) {
            [$key, $value] = explode('=', $pair);

            if ($value === 'null') {
                $value = null;
            }

            $keyValues[$key] = $value;
        }

        return $keyValues;
    }

    protected function updateRequest(Request $request, array $extractedState): Request
    {
        $request->merge($extractedState);

        return $request;
    }

}
