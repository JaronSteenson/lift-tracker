@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Your workout programs</div>

                <div class="card-body">
                    @foreach($workoutSchemes as $workoutScheme)
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
