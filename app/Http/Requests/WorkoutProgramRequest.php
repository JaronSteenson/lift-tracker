<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
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

            'workoutProgramRoutines.*.exercises.*.numberOfSets' => 'numeric|min:1|max:100',
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
        return $this->get('workoutProgramRoutines', []);
    }

    /**
     * @param int $programRoutineIndex
     * @return string[]
     */
    public function getRoutinesExercise(int $programRoutineIndex): array
    {
        return Arr::get($this->getProgramRoutine($programRoutineIndex), 'exercises', []);
    }

    protected function getProgramRoutine(int $programRoutineIndex): array
    {
        return $this->getWorkoutProgramRoutines()[$programRoutineIndex];
    }

    protected function getModelClass(): string
    {
        return WorkoutProgram::class;
    }
}
