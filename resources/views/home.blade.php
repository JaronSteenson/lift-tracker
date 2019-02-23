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
                                    <a href="{{ url("/workout-programs/$workoutProgram->id") }}">{{ $workoutProgram->name }}</a>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
