<?php /** @noinspection PhpVoidFunctionResultUsedInspection */

/** @noinspection PhpInconsistentReturnPointsInspection */

namespace LiftTracker\Http\Controllers;

use Illuminate\Contracts\View\Factory;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection;
use LiftTracker\Domain\Workouts\UserWorkouts\UserWorkoutProgram;
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

        /** @var WorkoutProgramCollection $workoutPrograms */
        $workoutPrograms = $user->workoutPrograms()->get();

        return view('home', ['workoutPrograms' => $workoutPrograms]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create(): Response
    {
        return view('workouts.userWorkoutProgram.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Routing\Redirector|\Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'=>'required|max:40',
        ]);

        $workoutProgram = new WorkoutProgram([
            'name' => $request->get('name'),
        ]);

        $workoutProgram->user()->associate(Auth::user());
        $workoutProgram->save();

        return redirect('/programs')->with('success', 'Workout program has been added');
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
            return view('workouts.userWorkoutProgram.edit', ['workoutProgram' => $workoutProgram]);
        }

        app()->abort(404);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param \LiftTracker\Http\Controllers\UserWorkoutProgram $userWorkoutProgram
     * @return void
     */
    public function update(Request $request, UserWorkoutProgram $userWorkoutProgram)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param \LiftTracker\Http\Controllers\UserWorkoutProgram $userWorkoutProgram
     * @return void
     */
    public function destroy(UserWorkoutProgram $userWorkoutProgram)
    {
        //
    }
}
