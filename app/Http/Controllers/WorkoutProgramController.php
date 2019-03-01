<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */
/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers;

use Illuminate\Contracts\View\Factory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use Illuminate\Http\Request;
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
        return view('workouts.workoutProgram.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Routing\Redirector|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->validateSaveRequest($request);

        $workoutProgram = new WorkoutProgram([
            'name' => $request->get('name'),
        ]);

        $workoutProgram->user()->associate(Auth::user());
        $workoutProgram->save();


        return redirect(route('workout-programs.index'))->with('success-alert', 'Workout program has been added');
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
        /** @var User $user */
        $user = Auth::user();

        if ($workoutProgram->isOwnedBy($user)) {
            return view('workouts.workoutProgram.edit', ['workoutProgram' => $workoutProgram]);
        }

        app()->abort(404);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param WorkoutProgram $workoutProgram
     * @return void|RedirectResponse
     */
    public function update(Request $request, WorkoutProgram $workoutProgram)
    {
        $this->validateSaveRequest($request);

        /** @var User $user */
        $user = Auth::user();

        if ($workoutProgram->isOwnedBy($user)) {
            $workoutProgram->name = $request->get('name');
            $workoutProgram->save();

            return redirect(route('workout-programs.index'))->with('success-alert', 'Workout program has been updated');
        }

        app()->abort(404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param WorkoutProgram $workoutProgram
     * @return void
     */
    public function destroy(WorkoutProgram $workoutProgram)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($workoutProgram->isOwnedBy($user)) {
            $workoutProgram->delete();

            return redirect(sroute('workout-programs.index'))->with('success-alert', 'Workout program has been deleted');
        }

        app()->abort(404);
    }

    private function validateSaveRequest(Request $request): void
    {
        $request->validate([
            'name'=>'required|max:40',
        ]);
    }
}
