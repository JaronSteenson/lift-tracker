<?php
namespace Tests\Helpers;

use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;

class WorkoutSessionFactory
{

    /**
     * @return RoutineExercise[]|SessionExercise[]
     */
    public function createSessionExerciseWithParents(): array
    {
        $workoutProgram = new WorkoutProgram();
        $workoutProgram->name = 'PPL';
        $workoutProgram->save();

        $routine = new WorkoutProgramRoutine();
        $routine->name = 'Push';
        $routine->position = 0;
        $routine->workoutProgramId = $workoutProgram->id;
        $routine->save();

        $routineExercise = new RoutineExercise();
        $routineExercise->name = 'BB bench';
        $routineExercise->workoutProgramRoutineId = $routine->id;
        $routineExercise->position = 0;
        $routineExercise->weight = 50;
        $routineExercise->save();

        $workoutSession = new WorkoutSession();
        $workoutSession->workoutProgramRoutineId = $routine->id;
        $workoutSession->save();

        $sessionExercise = new SessionExercise();
        $sessionExercise->name = 'Push';
        $sessionExercise->position = 0;
        $sessionExercise->workoutSessionId = $workoutSession->id;
        $sessionExercise->routineExerciseId = $routineExercise->id;
        $sessionExercise->save();

        return [$routineExercise, $sessionExercise];
    }

    /**
     * @return RoutineExercise[]|SessionExercise[]|SessionSet[]
     */
    public function createSessionSetWithParents(): array {
        [$routineExercise, $sessionExercise] = $this->createSessionExerciseWithParents();

        $sessionSet = new SessionSet();
        $sessionSet->position = 0;
        $sessionSet->sessionExerciseId = $sessionExercise->id;
        $sessionSet->save();

        return [$routineExercise, $sessionExercise, $sessionSet];
    }

}
