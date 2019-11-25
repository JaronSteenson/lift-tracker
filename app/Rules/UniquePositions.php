<?php

namespace LiftTracker\Rules;


use Illuminate\Contracts\Validation\Rule;

class UniquePositions implements Rule
{
    private $repeatedPosition;

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  array  $value
     * @return bool
     */
    public function passes($attribute, $value): bool
    {
        $foundPositions = [];

        foreach ($value as $childAttribute) {
            $position = $childAttribute['position'];

            if (array_key_exists($position, $foundPositions)) {
                $this->repeatedPosition = $position;
                return false;
            }

            $foundPositions[$position] = true;
        }

        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return "The :attribute must not contain repeating positions, {$this->repeatedPosition} found more than once";
    }
}
