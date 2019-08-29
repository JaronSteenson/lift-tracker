<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutineCollection;
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

    public function getWorkoutProgramRoutines(): WorkoutProgramRoutineCollection
    {
        $routines = array_map(static function (array $routine) {
            return new WorkoutProgramRoutine($routine);
        }, $this->get('workoutProgramRoutines', []));

        return new WorkoutProgramRoutineCollection($routines);
    }

    public function mergeExistingAndNewWorkoutRoutines(): WorkoutProgramRoutineCollection
    {
        $existingRoutines = $this->getExistingRoutines();
        $mergedRoutines = clone $existingRoutines;

        foreach ($this->getWorkoutProgramRoutines() as $index => $requestWorkoutRoutine) {
            $foundExisting = $mergedRoutines->find($requestWorkoutRoutine);

            if ($foundExisting) {
                $foundExisting->fill($requestWorkoutRoutine);
            } else {
                $mergedRoutines->add($requestWorkoutRoutine);
            }
        }

        return $mergedRoutines;
    }

    public function getExistingRoutines(): WorkoutProgramRoutineCollection
    {
        /** @var WorkoutProgram $existingWorkoutProgram */
        $existingWorkoutProgram = $this->getExistingModel();
        $existingWorkoutPrograms = new WorkoutProgramRoutineCollection();

        if ($existingWorkoutProgram) {
            $existingWorkoutPrograms = $existingWorkoutProgram->workoutProgramRoutines;
        }

        return $existingWorkoutPrograms;
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
