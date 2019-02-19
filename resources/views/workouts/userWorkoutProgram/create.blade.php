@extends('layouts.app')

@section('content')
    <h1>New workout program</h1>

    <form method="post" action="{{ route('programs.store') }}">
        <div class="form-group">
            @csrf
            <label for="name">Program name
                <input type="text" class="form-control" name="name"/>
            </label>
        </div>
        <button type="submit" class="btn btn-primary">Add</button>
    </form>
@endsection
