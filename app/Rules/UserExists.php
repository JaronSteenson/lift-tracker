<?php

namespace LiftTracker\Rules;

use Illuminate\Contracts\Validation\Rule;
use LiftTracker\User;

class UserExists implements Rule
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
        return User::where($attribute, '=', $value)->whereNotNull('emailVerifiedAt')->count() === 1;
    }


    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'No user with that :attribute exists';
    }
}
