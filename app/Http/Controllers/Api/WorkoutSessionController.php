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
use LiftTracker\Domain\Workouts\Programs\WorkoutSession;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\ApiRequest;
use LiftTracker\Http\Requests\WorkoutSessionRequest;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class WorkoutSessionController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param WorkoutSessionRequest $request
     * @return Collection|WorkoutPRogram[]|WorkoutProgram
     */
    public function index(WorkoutSessionRequest $request)
    {
//        if ($request->has('routine-uuid')) {
//            return $this->byRoutine($request);
//        }
//
//        /** @var User $loggedInUser */
//        $loggedInUser = $request->user();
//
//        return $loggedInUser->workoutPrograms()
//            ->without('workoutProgramRoutines')
//            ->orderBy('name')
//            ->orderBy('createdAt', 'desc')
//            ->get();
    }

    /**
     * Display the specified resource.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutProgram|Model
     */
    public function show(WorkoutSessionRequest $request): WorkoutProgram
    {
        return $request->getModelOr404();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param ApiRequest $request
     * @return WorkoutProgram
     */
    public function store(WorkoutSessionRequest $request)
    {
        if (!$request->has('origin-workout-uuid')) {
            throw new BadRequestHttpException('origin-workout-uuid must be supplied');
        }

        $originRoutine = (new WorkoutProgramRoutine())->findByUuid($request->get('origin-workout-uuid'));

        if ($originRoutine === null || $originRoutine->workoutProgram->isNotOwnedBy($request->user())) {
            throw new BadRequestHttpException('Origin workout not found');
        }

        return WorkoutSession::createFromRoutine($originRoutine);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param WorkoutSessionRequest $request
     * @return WorkoutProgram
     */
    public function update(WorkoutSessionRequest $request)
    {
        return $this->saveFromRequest($request);
    }

    private function saveFromRequest(WorkoutSessionRequest $request): WorkoutSession
    {
        $workoutProgram = WorkoutSession::createFromRequest($request);

        // Ensure partial payloads return the full response.
        return $workoutProgram->refresh();
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
