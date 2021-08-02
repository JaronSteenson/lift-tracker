<?php
namespace Tests\Helpers;

use Illuminate\Database\Eloquent\Model;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\User;

class WorkoutSessionFactory
{

    /**
     * @return RoutineExercise[]|SessionExercise[]
     */
    public function createSessionExerciseWithParents(User $owner = null): array
    {
        $workoutProgram = new WorkoutProgram();
        $workoutProgram->name = 'PPL';
        $workoutProgram->userId = $owner !== null ? $owner->id : null;
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
        $workoutSession->userId = $owner !== null ? $owner->id : null;
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
    public function createSessionSetsWithParents(User $owner = null, int $numberOfSets = 1): array {
        [$routineExercise, $sessionExercise] = $this->createSessionExerciseWithParents($owner);

        $sessionSets = [];
        for ($i = 0; $i <= $numberOfSets - 1; $i++) {
            $sessionSet = new SessionSet();
            $sessionSet->position = $i;
            $sessionSet->sessionExerciseId = $sessionExercise->id;
            $sessionSet->save();

            $sessionSets[] = $sessionSet;
        }

        $parents = [$routineExercise, $sessionExercise];

        return array_merge($parents, $sessionSets);
    }

}
