<?php

namespace LiftTracker\Rules;

use Illuminate\Contracts\Validation\Rule;

class DayOfTheWeek implements Rule
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
        return in_array($value, $this->getValidDaysOfTheWeek(), true);
    }

    /**
     * @param bool $includeAny
     * @return string[]
     */
    private function getValidDaysOfTheWeek(bool $includeAny = true): array
    {
        $days = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
        ];

        if ($includeAny) {
            $days []= 'any';
            $days []= null; // Equivalent to any.
        }

        return $days;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return 'The :attribute must be a day of the week or "any".';
    }
}
