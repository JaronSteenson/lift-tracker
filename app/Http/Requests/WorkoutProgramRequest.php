<?php

namespace LiftTracker\Http\Requests;

use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Rules\DayOfTheWeek;

class WorkoutProgramRequest extends ApiRequest
{
    protected function getValidationRules(): array
    {
        return [
            'name' => 'required|max:40',

            'workoutProgramRoutines.*.name' => 'required|max:40',
            'workoutProgramRoutines.*.normalDay' => ['required', new DayOfTheWeek()],

            'workoutProgramRoutines.*.exercises.*.numberOfSets' => 'numeric|min:1|max:20',
        ];
    }

    public function getWorkoutProgramFields(): array
    {
        return $this->only('name');
    }

    public function getWorkoutProgramId(): string
    {
        return $this->get('id');
    }

    /**
     * @return string[]
     */
    public function getWorkoutProgramRoutines(): array
    {
        return $this->get('workoutProgramRoutines');
    }

    /**
     * @param int $programRoutineIndex
     * @return string[]
     */
    public function getRoutinesExercise(int $programRoutineIndex): array
    {
        return $this->getWorkoutProgramRoutines()[$programRoutineIndex]['exercises'];
    }

    protected function getModelClass(): string
    {
        return WorkoutProgram::class;
    }
}