<?php

namespace LiftTracker\Rules;

use Illuminate\Contracts\Validation\Rule;

class Uuid implements Rule
{

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value): bool
    {
        return \Webpatser\Uuid\Uuid::validate($value);
    }


    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'The :attribute must be a v4 uuid';
    }
}
