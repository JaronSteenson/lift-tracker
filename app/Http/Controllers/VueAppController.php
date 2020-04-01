<?php

namespace LiftTracker\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;
use LiftTracker\Domain\Workouts\Exercises\Exercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection;
use LiftTracker\User;

class VueAppController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return View
     */
    public function index(): View
    {
        return view('vue-app');
    }
}
