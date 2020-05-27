<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\WorkoutSessionRequest;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class WorkoutSessionController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param WorkoutSessionRequest $request
     * @return Collection|WorkoutProgram[]|WorkoutProgram
     */
    public function index(WorkoutSessionRequest $request): Collection
    {
        /** @var User $loggedInUser */
        $loggedInUser = $request->user();

        return $loggedInUser->workoutSessions()
            ->without('sessionExercises', 'sessionExercises.sessionSets')
            ->orderBy('createdAt', 'asc')
            ->get();
    }

    /**
     * Display the specified resource.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutSession|Model
     */
    public function show(WorkoutSessionRequest $request): WorkoutSession
    {
        return $request->getModelOr404();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutSession
     */
    public function store(WorkoutSessionRequest $request): WorkoutSession
    {
        if (!$request->has('origin-workout-uuid')) {
            throw new BadRequestHttpException('origin-workout-uuid must be supplied');
        }

        /** @var WorkoutProgramRoutine $originRoutine */
        $originRoutine = (new WorkoutProgramRoutine())->findByUuid($request->get('origin-workout-uuid'));

        // Only supporting doing your own workout for now.
        if ($originRoutine === null || $originRoutine->workoutProgram->isNotOwnedBy($request->user())) {
            throw new BadRequestHttpException('Origin workout not found');
        }

        return WorkoutSession::createFromRoutine($originRoutine, $request->user()->id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutSession
     */
    public function update(WorkoutSessionRequest $request)
    {
        return $this->saveFromRequest($request);
    }

    private function saveFromRequest(WorkoutSessionRequest $request): WorkoutSession
    {
        $workoutSession = WorkoutSession::createFromRequest($request);

        // Ensure partial payloads return the full response.
        return $workoutSession->refresh();
    }


    /**
     * Remove the specified resource from storage.HasUuidTrait.php
     *
     * @param WorkoutSessionRequest $request Validates ownership, dataFrom not remove
     * @return void
     * @throws Exception
     */
    public function destroy(WorkoutSessionRequest $request)
    {
        $request->getModelOr404()->delete();
    }

}
