<?php

namespace Tests\Unit\Domain\Workouts\Programs;

use Exception;
use Illuminate\Support\Collection;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\RoutineExerciseCollection;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use Tests\TestCase;

class WorkoutProgramRoutineTest extends TestCase
{

    /**
     * @throws Exception
     */
    public function testMultipleRoutinesWithSameIdCannotBeSaved(): void
    {
        $this->expectException(Exception::class);

        $routineOne = new WorkoutProgramRoutine([
            'name' => 'Day one',
            'normalDay' => 'Monday',
            'position' => 0,
        ]);

        $routineOne->workoutProgramId = '123e4567-e89b-12d3-a456-426655440000';
        $routineOne->save();

        $routineTwo = new WorkoutProgramRoutine([
            'name' => 'Day Two',
            'normalDay' => 'Monday',
            'position' => 0,
        ]);

        $routineTwo->id = $routineOne->id;
        $routineTwo->workoutProgramId = '123e4567-e89b-12d3-a456-426655440000';

        $routineTwo->save();
    }

    public function testDeleteRemovesExercises(): void
    {
        $routine = new WorkoutProgramRoutine([
            'name' => 'Day one',
            'normalDay' => 'Monday',
            'position' => 0,
        ]);

        $exercises = new Collection([new RoutineExercise(['name' => 'push ups', 'position' => 0])]);

        $routine->setRoutineExercises($exercises)->saveWithExercises();

        $savedExercise = $routine->routineExercises()->first();
        static::assertNotNull($savedExercise);

        $routine->delete();

        $deletedExercise = $savedExercise->find($savedExercise->id);
        static::assertNull($deletedExercise);
    }

}
