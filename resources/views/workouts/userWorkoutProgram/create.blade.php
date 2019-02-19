@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('New workout program') }}</div>

                <div class="card-body">
                    <form method="POST" action="{{ route('workout-programs.store') }}">
                        @csrf

                        <div class="form-group row">
                            <label for="new-workout-program-name"
                                   class="col-md-4 col-form-label text-md-right">{{ __('Program name') }}</label>

                            <div class="col-md-6">
                                <input id="new-workout-program-name" type="text"
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
                                    {{ __('Create workout program') }}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
