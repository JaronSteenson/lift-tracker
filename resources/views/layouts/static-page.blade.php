@extends('layouts.base')

@section('title')
    <title>{{ config('app.name', 'Lift Tracker') }} - @yield('sub-title')</title>
@stop

@section('inline-styles')
    <style>
        body {
            display: flex;
            justify-content: center;
            font-family: "Roboto", sans-serif;
        }

        main {
            padding: 20px;
            max-width: 960px;
            background: white;
        }
    </style
@stop

@section('body')
    <body>
        <main>
            @yield('main-content')
        </main>
    </body>
@stop
