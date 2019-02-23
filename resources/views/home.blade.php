@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Your workout programs') }}</div>

                <div class="card-body">
                    <div class="row">
                        <a href="{{ route('workout-programs.index') }}">Manage your workout programs</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
