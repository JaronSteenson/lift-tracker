@extends('layouts.app')

@section('content')
    <h1>Your workout programs</h1>

    <ul>
        @foreach ($userWorkoutPrograms as $workoutProgram)
            <li>
                <a href="{{ url("/workout-programs/$workoutProgram->id") }}">{{ $workoutProgram->name }}</a>
            </li>
        @endforeach
    </ul>
@endsection
