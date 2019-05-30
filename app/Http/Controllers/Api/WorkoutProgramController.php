<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Illuminate\Contracts\View\Factory;
use Illuminate\Database\Eloquent\Collection;
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
        return $request->user()->workoutPrograms()->get();
    }

    /**
     * Display the specified resource.
     *
     * @param WorkoutProgram $workoutProgram
     * @return WorkoutProgram
     */
    public function show(WorkoutProgram $workoutProgram): WorkoutProgram
    {
        $workoutProgram->workoutProgramRoutines()->get()->each(static function (WorkoutProgramRoutine $routine) {
            $routine->exercises()->get();
        });

        return $workoutProgram;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram
     */
    public function store(WorkoutProgramRequest $request)
    {
        $workoutProgram = DB::transaction(function() use ($request) {
            return $this->saveWorkoutProgramAndChildren($request);
        });

        return $workoutProgram;
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
     * Update the specified resource in storage.
     *
     * @param WorkoutProgramRequest $request
     * @param WorkoutProgram $workoutProgram
     * @return void|RedirectResponse
     */
    public function update(WorkoutProgramRequest $request, WorkoutProgram $workoutProgram)
    {
        $workoutProgram->name = $request->get('name');
        $workoutProgram->save();

        return redirect(route('workout-programs.index'))->with('success-alert', 'Workout program has been updated');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param WorkoutProgramRequest $request Validates ownership, do not remove
     * @param WorkoutProgram $workoutProgram
     * @return void
     */
    public function destroy(WorkoutProgramRequest $request, WorkoutProgram $workoutProgram)
    {
        $workoutProgram->delete();
        return redirect(route('workout-programs.index'))->with('success-alert', 'Workout program has been deleted');
    }

}
