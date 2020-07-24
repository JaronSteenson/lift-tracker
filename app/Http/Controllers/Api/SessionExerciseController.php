<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\SessionExerciseRequest;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SessionExerciseController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param SessionExerciseRequest $request
     * @return Collection | SessionExercise[] | SessionExercise
     */
    public function index(SessionExerciseRequest $request)
    {
        throw new NotFoundHttpException();
    }

    /**
     * Display the specified resource.
     *
     * @param SessionExerciseRequest $request
     * @return SessionExercise|Model
     */
    public function show(SessionExerciseRequest $request): SessionExercise
    {
        return $request->getModelOr404();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param SessionExerciseRequest $request
     * @return SessionExercise
     */
    public function store(SessionExerciseRequest $request): SessionExercise
    {
        $sessionExercise = new SessionExercise($request->all());

        $sessionExercise->save();

        return $sessionExercise;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param SessionExerciseRequest $request
     * @return SessionExercise
     */
    public function update(SessionExerciseRequest $request)
    {
        /** @var SessionExercise $sessionExercise */
        $sessionExercise = $request->getModelOr404()->fill($request->all());

        $sessionExercise->save();
        $sessionExercise->touchOwners();

        return $sessionExercise;
    }


    /**
     * Remove the specified resource from storage.HasUuidTrait.php
     *
     * @param SessionExerciseRequest $request Validates ownership, dataFrom not remove
     * @return void
     * @throws Exception
     */
    public function destroy(SessionExerciseRequest $request)
    {
        $request->getModelOr404()->delete();
    }

}
