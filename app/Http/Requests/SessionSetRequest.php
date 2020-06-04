<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;

class SessionSetRequest extends ApiRequest
{

    /**
     * Get all of the input and files for the request.
     *
     * @param  array|mixed|null  $keys
     * @return array
     */
    public function all($keys = null)
    {
        $input = array_replace_recursive($this->input(), $this->allFiles());

        if (! $keys) {
            return $input;
        }

        $results = [];

        foreach (is_array($keys) ? $keys : func_get_args() as $key) {
            Arr::set($results, $key, Arr::get($input, $key));
        }//TODO jaron check dates here???

        return $results;
    }

    protected function getModelClass(): string
    {
        return SessionSet::class;
    }

}
