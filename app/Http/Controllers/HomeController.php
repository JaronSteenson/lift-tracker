<?php

namespace LiftTracker\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection;
use LiftTracker\User;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        /** @var WorkoutProgramCollection $userWorkoutPrograms */
        $userWorkoutPrograms = $user->workoutPrograms()->get();

        return view('home', ['userWorkoutPrograms' => $userWorkoutPrograms]);
    }
}
