<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\WorkoutSessionRequest;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WorkoutSessionController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param WorkoutSessionRequest $request
     * @return Paginator|WorkoutSession[]|WorkoutSession
     */
    public function index(WorkoutSessionRequest $request)
    {
        if ($request->has('session-set-uuid')) {
            return $this->bySet($request);
        }

        /** @var User $loggedInUser */
        $loggedInUser = $request->user();

        return $loggedInUser->getWorkoutSessionsPaginated();
    }

    /**
     * Display by set uuid look up.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutSession
     */
    public function bySet(WorkoutSessionRequest $request): WorkoutSession
    {
        $foundBySet = (new WorkoutSession())->findBySet($request->get('session-set-uuid'));

        if ($foundBySet === null || $foundBySet->isNotOwnedBy($request->user())) {
            throw new NotFoundHttpException();
        }

        return $foundBySet;
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
        $workoutSession = WorkoutSession::createFromRequest($request);
        $workoutSession->save();
        $workoutSession->saveExercisesFromRequest($request->get('sessionExercises'));

        // Ensure partial payloads return the full response.
        return $workoutSession->findByUuid($workoutSession->uuid);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutSession
     */
    public function update(WorkoutSessionRequest $request): WorkoutSession
    {
        $workoutSession = WorkoutSession::createFromRequest($request);
        $workoutSession->save();

        // Ensure partial payloads return the full response.
        return $workoutSession->findByUuid($workoutSession->uuid);
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
        /** @var WorkoutSession $model */
        $model = $request->getModelOr404();

        $model->deleteWithChildren();
    }

}
