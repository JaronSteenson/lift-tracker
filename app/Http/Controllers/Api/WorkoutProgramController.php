<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Contracts\View\Factory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use LiftTracker\User;

class WorkoutProgramController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param WorkoutProgramRequest $request
     * @return Collection|WorkoutProgramCollection
     */
    public function index(WorkoutProgramRequest $request): WorkoutProgramCollection
    {
        /** @var User $loggedInUser */
        $loggedInUser = $request->user();

        return $loggedInUser->workoutPrograms()
            ->without('workoutProgramRoutines')
            ->orderBy('name')
            ->orderBy('createdAt', 'desc')
            ->get();
    }

    /**
     * Display the specified resource.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram|Model
     */
    public function show(WorkoutProgramRequest $request): WorkoutProgram
    {
        return $request->getModelOr404();
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
     * @param WorkoutProgramRequest $request Validates ownership, do not remove
     * @return void
     * @throws Exception
     */
    public function destroy(WorkoutProgramRequest $request)
    {
        $request->getModelOr404()->delete();
    }

}
