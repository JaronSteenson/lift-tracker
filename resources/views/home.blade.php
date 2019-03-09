@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card card-default">
                <div class="card-header">Hi</div>

                <div class="card-body">
                    <a href="{{ route('workout-programs.index') }}">manage your workout programs</a>
                </div>
            </div>
        </div>
    </div>
@endsection
