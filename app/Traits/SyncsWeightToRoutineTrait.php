<?php

namespace LiftTracker\Traits;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;
use InvalidArgumentException;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\User;
use RuntimeException;
use Webpatser\Uuid\Uuid;

/**
 * Syncs the weight back to the parent workout program,
 * so editing the workout program reflects the new state of affairs,
 * and future sessions use the new weight automatically.
 *
 * Trait HasUuidTrait
 * @package LiftTracker\Traits
 * @property $uuid string
 */
trait SyncsWeightToRoutineTrait
{

    /**
     * Trait boot method, run automatic on models using this trait.
     */
    public static function bootSyncsWeightToRoutineTrait(): void
    {
        // There is zero point syncing on creating due ot creation of session exercises generally being driven from
        // their parent workout program.
        static::updating(static function (SessionSet $sessionSet) {
            $sessionSet->syncWeightToRoutine();
        });
    }

    public function syncWeightToRoutine(): self
    {
        /** @var SessionExercise $sessionExercise */
        $sessionExercise = $this->sessionExercise;

        if ($sessionExercise === null) {
            throw new RuntimeException('Session set did not have a parent Session exercise');
        }

        $routineExercise = $sessionExercise->routineExercise;

        if ($routineExercise === null) {
            return $this;
        }

        $workoutSessionOwner = new User();
        $workoutSessionOwner->id = $sessionExercise->workoutSession->userId;

        if ($routineExercise->isOwnedBy($workoutSessionOwner)) {
            $routineExercise->syncWeightFromSessionSet($this);
        }

        return $this;
    }

}
