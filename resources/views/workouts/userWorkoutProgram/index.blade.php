<?php /** @var \LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection $workoutPrograms */?>

@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Your workout programs') }}</div>

                <div class="card-body">
                    <div class="row">
                        <ul>
                            @foreach ($workoutPrograms as $workoutProgram)
                                <li>
                                    <a href="{{ route('workout-programs.edit', $workoutProgram->id)}}">{{ $workoutProgram->name }}</a>

                                    <form class="display-inline" action="{{ route('workout-programs.destroy', $workoutProgram->id)}}" method="post">
                                        @csrf
                                        @method('DELETE')
                                        <button class="btn btn-link" type="submit">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </form>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
