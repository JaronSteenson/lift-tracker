@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Workout programs</div>

                <div class="card-body">
                    @foreach($nonUserDefinedWorkoutPrograms as $program)
                        <li>{{$program->name}}</li>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
