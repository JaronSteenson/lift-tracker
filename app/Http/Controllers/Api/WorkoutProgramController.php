<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

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
        $workoutProgram = WorkoutProgram::createFromRequest($request);

        $workoutProgram->saveWithChildren();

        return $workoutProgram;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param WorkoutProgramRequest $request
     * @return void|RedirectResponse
     */
    public function update(WorkoutProgramRequest $request)
    {
        return $this->saveFromRequest($request);
    }

    private function saveFromRequest(WorkoutProgramRequest $request)
    {
        return DB::transaction(function() use ($request) {
            return $this->saveWorkoutProgramAndChildren($request);
        });
    }

    private function saveWorkoutProgramAndChildren(WorkoutProgramRequest $request)
    {
        //TODO separate out request deserialization and saving.
        $workoutProgram = new WorkoutProgram($request->getWorkoutProgramFields());

        $workoutProgram->user()->associate(Auth::user());
        $workoutProgram->save();

        /** @var WorkoutProgramRoutine[] $workoutProgramRoutines */
        $workoutProgramRoutines = array_map(static function (array $requestWorkoutRoutine) {
            return new WorkoutProgramRoutine($requestWorkoutRoutine);
        }, $request->getWorkoutProgramRoutines());

        $workoutProgram->saveManyProgramRoutines(...$workoutProgramRoutines);

        foreach ($workoutProgramRoutines as $index => $workoutProgramRoutine) {
            $requestRoutines = $request->getWorkoutProgramRoutines();

            $exercises = array_map(static function (array $requestExercise) {
                return new RoutineExercise($requestExercise);
            }, $requestRoutines[$index]['exercises']);

            $workoutProgramRoutine->saveManyRoutineExercises(...$exercises);
        }

        return $workoutProgram;
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param WorkoutProgramRequest $request Validates ownership, do not remove
     * @return void
     * @throws \Exception
     */
    public function destroy(WorkoutProgramRequest $request)
    {
        $request->getModelOr404()->delete();

        return redirect(route('workout-programs.index'))->with('success-alert', 'Workout program has been deleted');
    }

}
