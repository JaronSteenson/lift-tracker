<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\SessionSetRequest;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SessionSetController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param SessionSetRequest $request
     * @return Collection | SessionSet[] | SessionSet
     */
    public function index(SessionSetRequest $request)
    {
        throw new NotFoundHttpException();
    }

    /**
     * Display the specified resource.
     *
     * @param SessionSetRequest $request
     * @return SessionSet|Model
     */
    public function show(SessionSetRequest $request): SessionSet
    {
        return $request->getModelOr404();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param SessionSetRequest $request
     * @return SessionSet
     */
    public function store(SessionSetRequest $request): SessionSet
    {
        $sessionSet = new SessionSet($request->all());

        $sessionSet->save();

        return $sessionSet;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param SessionSetRequest $request
     * @return SessionSet
     */
    public function update(SessionSetRequest $request)
    {
        /** @var SessionSet $sessionSet */
        $sessionSet = $request->getModelOr404()->fill($request->all());

        $sessionSet->save();
        $sessionSet->touchOwners();

        return $sessionSet;
    }


    /**
     * Remove the specified resource from storage.HasUuidTrait.php
     *
     * @param SessionSetRequest $request Validates ownership, dataFrom not remove
     * @return void
     * @throws Exception
     */
    public function destroy(SessionSetRequest $request)
    {
        $request->getModelOr404()->delete();
    }

}
