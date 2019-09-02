<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\RoutineExerciseCollection;
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

    public function getRequestWorkoutProgramRoutines(): WorkoutProgramRoutineCollection
    {
        $routines = array_map(function (array $requestRoutine) {
            $routine = new WorkoutProgramRoutine($requestRoutine);
            $routine->id = Arr::get($requestRoutine, 'id');

            $routine->setRoutineExercises($this->getRequestExercises($requestRoutine));

            return $routine;
        }, $this->get('workoutProgramRoutines', []));

        return new WorkoutProgramRoutineCollection($routines);
    }

    private function getRequestExercises(array $requestRoutine): RoutineExerciseCollection
    {
        $requestExercises = Arr::get($requestRoutine, 'exercises', []);

        $requestExerciseModels = array_map(static function (array $requestExercise) {
            $exercise =  new RoutineExercise($requestExercise);
            $exercise->id = $requestExercise['id'];

            return $exercise;
        }, $requestExercises);

        return new RoutineExerciseCollection($requestExerciseModels);
    }

    public function mergeExistingAndNewWorkoutRoutines(): WorkoutProgramRoutineCollection
    {
        $existingRoutines = $this->getExistingRoutines();
        $newAndExisting = new WorkoutProgramRoutineCollection();

        foreach ($this->getRequestWorkoutProgramRoutines() as $index => $requestWorkoutRoutine) {
            /** @var WorkoutProgramRoutine $foundExisting */
            $foundExisting = $existingRoutines->find($requestWorkoutRoutine);

            if ($foundExisting) {
                $existing = clone $foundExisting;
                $existing->fill($requestWorkoutRoutine->toArray());
                $existing->setRoutineExercises($requestWorkoutRoutine->routineExercises);

                $newAndExisting->add($existing);
                $updatedRoutine = $existing;
            } else {
                $newAndExisting->add($requestWorkoutRoutine);
                $updatedRoutine = $requestWorkoutRoutine;
            }

            // Apply the same again for this records children.
            $newAndExistingExercises = $this->mergeExistingAndNewExercises($updatedRoutine);
            $updatedRoutine->associateExercises($newAndExistingExercises);
        }

        return $newAndExisting;
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

    public function mergeExistingAndNewExercises(WorkoutProgramRoutine $routine): RoutineExerciseCollection
    {
        $existingExercises = $this->getExistingExercises($routine);
        $newAndExisting = new RoutineExerciseCollection();

        foreach ($routine->routineExercises as $index => $requestExercise) {
            $foundExisting = $existingExercises->find($requestExercise);

            if ($foundExisting) {
                $existing = clone $foundExisting;
                $existing->fill($requestExercise->toArray());

                $newAndExisting->add($existing);
            } else {
                $newAndExisting->add($requestExercise);
            }
        }

        return $newAndExisting;
    }

    /**
     * @param mixed $routine
     * @return RoutineExerciseCollection
     */
    public function getExistingExercises($routine): RoutineExerciseCollection
    {
        /** @var WorkoutProgramRoutine $existingRoutine */
        $existingRoutine = $this->getExistingRoutines()->find($routine);

        if ($existingRoutine) {
            return $existingRoutine->routineExercises;
        }

        return new RoutineExerciseCollection();
    }

    protected function getModelClass(): string
    {
        return WorkoutProgram::class;
    }

}
