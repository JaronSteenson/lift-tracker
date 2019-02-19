<?php

namespace LiftTracker\Http\Controllers;

use Illuminate\Http\Response;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\UserWorkouts\UserWorkoutProgram;
use Illuminate\Http\Request;

class UserWorkoutProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        //workout_program.name, -> user_workout_program
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


        //TODO attach current session user if it is not a community workout
        $workoutProgram = new WorkoutProgram([
            'name' => $request->get('name'),
        ]);

        $workoutProgram->save();


        return redirect('/programs')->with('success', 'Workout program has been added');
    }

    /**
     * Display the specified resource.
     *
     * @param \LiftTracker\Http\Controllers\UserWorkoutProgram $userWorkoutProgram
     * @return void
     */
    public function show(UserWorkoutProgram $userWorkoutProgram)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param \LiftTracker\Http\Controllers\UserWorkoutProgram $userWorkoutProgram
     * @return void
     */
    public function edit(UserWorkoutProgram $userWorkoutProgram)
    {
        //
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
