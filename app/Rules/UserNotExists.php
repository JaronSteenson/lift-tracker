<?php

namespace LiftTracker\Rules;

use Illuminate\Contracts\Validation\Rule;
use LiftTracker\User;

class UserNotExists implements Rule
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
        return User::where($attribute, '=', $value)->whereNotNull('emailVerifiedAt')->count() === 0;
    }


    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'A user with that :attribute already exists';
    }
}
