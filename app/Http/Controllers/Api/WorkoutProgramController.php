<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers\Api;

use Illuminate\Contracts\View\Factory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use LiftTracker\User;

class WorkoutProgramController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return View
     */
    public function index(): View
    {
        /** @var User $user */
        $user = Auth::user();

        $workoutPrograms = $user->findWorkoutPrograms();

        return view('workouts.workoutProgram.index', ['workoutPrograms' => $workoutPrograms]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return View
     */
    public function create(): View
    {
        $availableExercises = Exercise::all();
        return view('workouts.workoutProgram.create', ['availableExercises' => $availableExercises]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param WorkoutProgramRequest $request
     * @return WorkoutProgram
     */
    public function store(WorkoutProgramRequest $request)
    {
        $workoutProgram = new WorkoutProgram([
            'name' => $request->get('name'),
        ]);

        $workoutProgram->user()->associate(Auth::user());
        $workoutProgram->save();

        return $workoutProgram;
    }

    /**
     * Display the specified resource.
     *
     * @param WorkoutProgram $workoutProgram
     * @return void|View|Factory
     */
    public function show(WorkoutProgram $workoutProgram)
    {
        return $this->edit($workoutProgram);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param WorkoutProgram $workoutProgram
     * @return void
     */
    public function edit(WorkoutProgram $workoutProgram)
    {
        $availableExercises = Exercise::all();

        return view('workouts.workoutProgram.edit', [
            'workoutProgram' => $workoutProgram,
            'availableExercises' => $availableExercises,
        ]);
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
