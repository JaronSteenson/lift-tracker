<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Rules\DayOfTheWeek;
use LiftTracker\Rules\UniquePositions;
use LiftTracker\Rules\Uuid;

class BuilderMoveExerciseRequest extends ApiRequest
{
    protected function getValidationRules(): array
    {
        return [
            'uuid' => ['nullable', new Uuid()],
            'name' => 'nullable|max:40',

            'workoutProgramRoutines.*.uuid' => ['nullable', new Uuid()],
            'workoutProgramRoutines.*.name' => 'nullable|max:40',
            'workoutProgramRoutines.*.normalDay' => [new DayOfTheWeek()],
            'workoutProgramRoutines' => [new UniquePositions()],

            'workoutProgramRoutines.*.routineExercises.*.uuid' => ['nullable', new Uuid()],
            'workoutProgramRoutines.*.routineExercises.*.numberOfSets' => 'nullable|numeric|min:1|max:100',
            'workoutProgramRoutines.*.routineExercises' => [new UniquePositions()]
        ];
    }

    public function getWorkoutProgramFields(): array
    {
        return $this->only('name');
    }

    public function getRequestWorkoutProgramRoutines(): Collection
    {
        $routines = array_map(function (array $requestRoutine) {
            $routine = new WorkoutProgramRoutine($requestRoutine);
            $routine->uuid = Arr::get($requestRoutine, 'uuid');

            $routine->setRoutineExercises($this->getRequestExercises($requestRoutine));

            return $routine;
        }, $this->get('workoutProgramRoutines', []));

        return new Collection($routines);
    }

    private function getRequestExercises(array $requestRoutine): Collection
    {
        $requestExercises = Arr::get($requestRoutine, 'routineExercises', []);

        $requestExerciseModels = array_map(static function (array $requestExercise) {
            $exercise =  new RoutineExercise($requestExercise);
            $exercise->id = Arr::get($requestExercise, 'id');

            return $exercise;
        }, $requestExercises);

        return new Collection($requestExerciseModels);
    }

    public function mergeExistingAndNewWorkoutRoutines(): Collection
    {
        $existingRoutines = $this->getExistingRoutines();
        $newAndExisting = new Collection();

        foreach ($this->getRequestWorkoutProgramRoutines() as $index => $requestWorkoutRoutine) {
            /** @var WorkoutProgramRoutine $foundExisting */
            $foundExisting = $existingRoutines->firstWhere('uuid', $requestWorkoutRoutine->uuid);

            if ($foundExisting) {
                $existing = clone $foundExisting;
                $existing->fill($requestWorkoutRoutine->toArray());

                $newAndExisting->add($existing);
                $updatedRoutine = $existing;
            } else {
                $newAndExisting->add($requestWorkoutRoutine);
                $updatedRoutine = $requestWorkoutRoutine;
            }

            // Apply the same again for this records children.
            $newAndExistingExercises = $this->mergeExistingAndNewExercises($requestWorkoutRoutine);
            $updatedRoutine->setRoutineExercises($newAndExistingExercises);
        }

        return $newAndExisting;
    }

    public function getExistingRoutines(): Collection
    {
        /** @var WorkoutProgram $existingWorkoutProgram */
        $existingWorkoutProgram = $this->getExistingModel();
        $existingWorkoutPrograms = new Collection();

        if ($existingWorkoutProgram) {
            $existingWorkoutPrograms = $existingWorkoutProgram->workoutProgramRoutines;
        }

        return $existingWorkoutPrograms;
    }

    public function mergeExistingAndNewExercises(WorkoutProgramRoutine $requestRoutine): Collection
    {
        $existingExercises = $this->getExistingExercisesForRoutine($requestRoutine);
        $newAndExisting = new Collection();

        foreach ($requestRoutine->routineExercises as $index => $requestExercise) {
            $foundExisting = $existingExercises->firstWhere('uuid', $requestExercise->uuid);

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
     * @return Collection
     */
    public function getExistingExercisesForRoutine($routine): Collection
    {
        /** @var WorkoutProgramRoutine $existingRoutine */
        $existingRoutine = $this->getExistingRoutines()->firstWhere('uuid', $routine->uuid);

        if ($existingRoutine) {
            return $existingRoutine->routineExercises;
        }

        return new Collection();
    }

    protected function getModelClass(): string
    {
        return WorkoutProgram::class;
    }

}
