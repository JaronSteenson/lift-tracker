<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WorkoutProgramController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param WorkoutProgramRequest $request
     * @return Collection|WorkoutPRogram[]|WorkoutProgram
     */
    public function index(WorkoutProgramRequest $request)
    {
        if ($request->has('routine-uuid')) {
            return $this->byRoutine($request);
        }

        /** @var User $loggedInUser */
        $loggedInUser = $request->user();

        return $loggedInUser->getWorkoutPrograms();
    }

    /**
     * Display the specified resource.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram|Model
     */
    public function show(WorkoutProgramRequest $request): WorkoutProgram
    {
        return $request->getModelOr404()->load('workoutProgramRoutines.routineExercises');
    }

    /**
     * Display by routine uuid look up.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram
     */
    public function byRoutine(WorkoutProgramRequest $request): WorkoutProgram
    {
        $foundByRoutine = (new WorkoutProgram())->findByRoutine($request->get('routine-uuid'));

        if ($foundByRoutine === null || $foundByRoutine->isNotOwnedBy($request->user())) {
            throw new NotFoundHttpException();
        }

        return $foundByRoutine->load('workoutProgramRoutines.routineExercises');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram
     */
    public function store(WorkoutProgramRequest $request)
    {
        return $this->saveFromRequest($request);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram
     */
    public function update(WorkoutProgramRequest $request)
    {
        return $this->saveFromRequest($request);
    }

    private function saveFromRequest(WorkoutProgramRequest $request): WorkoutProgram
    {
        $workoutProgram = WorkoutProgram::createFromRequest($request);

        $workoutProgram->saveWithChildren();

        // Ensure partial payloads return the full response.
        return $workoutProgram->refresh();
    }


    /**
     * Remove the specified resource from storage.HasUuidTrait.php
     *
     * @param WorkoutProgramRequest $request Validates ownership, dataFrom not remove
     * @return void
     * @throws Exception
     */
    public function destroy(WorkoutProgramRequest $request)
    {
        $request->getModelOr404()->delete();
    }

}
