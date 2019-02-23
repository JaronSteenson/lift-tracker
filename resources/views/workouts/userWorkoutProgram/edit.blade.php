<?php /** @var \LiftTracker\Domain\Workouts\Programs\WorkoutProgram $workoutProgram */?>

@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Edit workout program') }}</div>

                <div class="card-body">
                    <form method="POST" action="{{ route('workout-programs.update', $workoutProgram->id) }}">
                        @method('PATCH')
                        @csrf

                        <div class="form-group row">
                            <label for="edit-workout-program-name"
                                   class="col-md-4 col-form-label text-md-right">{{ __('Program name') }}</label>

                            <div class="col-md-6">
                                <input id="edit-workout-program-name" type="text" value="{{ $workoutProgram->name }}"
                                       class="form-control{{ $errors->has('name') ? ' is-invalid' : '' }}"
                                       name="name" required>

                                @if ($errors->has('name'))
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $errors->first('name') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group row mb-0">
                            <div class="col-md-8 offset-md-4">
                                <button type="submit" class="btn btn-primary">
                                    {{ __('Update workout program') }}
                                </button>

                                    <a class="btn btn-link" href="{{ route('workout-programs.index') }}">
                                        {{ __('cancel') }}
                                    </a>
                                </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
