@extends('layouts.base')

@section('title')
    <title>{{ config('app.name', 'Lift Tracker') }}</title>
@stop

@section('assets')
    <!-- JS app bundle, includes css. -->
    <script src="{{ asset('js/app.js') }}" defer></script>
@stop

@section('inline-styles')
    <style>
        .initial-loading {
            margin-top: 40vh;
            text-align: center;
            color: {{ config('app.app_icon_background_color') }};
            font-size: 2em;
            font-family: Roboto, sans-serif;
        }

        .lds-ellipsis {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 80px;
        }

        .lds-ellipsis div {
            position: absolute;
            top: 33px;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: {{ config('app.app_icon_background_color') }};
            animation-timing-function: cubic-bezier(0, 1, 1, 0);
        }

        .lds-ellipsis div:nth-child(1) {
            left: 8px;
            animation: lds-ellipsis1 0.6s infinite;
        }

        .lds-ellipsis div:nth-child(2) {
            left: 8px;
            animation: lds-ellipsis2 0.6s infinite;
        }

        .lds-ellipsis div:nth-child(3) {
            left: 32px;
            animation: lds-ellipsis2 0.6s infinite;
        }

        .lds-ellipsis div:nth-child(4) {
            left: 56px;
            animation: lds-ellipsis3 0.6s infinite;
        }

        @keyframes lds-ellipsis1 {
            0% {
                transform: scale(0);
            }
            100% {
                transform: scale(1);
            }
        }

        @keyframes lds-ellipsis3 {
            0% {
                transform: scale(1);
            }
            100% {
                transform: scale(0);
            }
        }

        @keyframes lds-ellipsis2 {
            0% {
                transform: translate(0, 0);
            }
            100% {
                transform: translate(24px, 0);
            }
        }
    </style>
@stop

@section('body')
    <body data-app-bootstrap="{{ json_encode($appBootstrapData) }}">
    <div id="fb-root"></div>
    <script
        async
        defer
        crossorigin="anonymous"
        src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v10.0&"
        nonce="toPhUntS"
    >
    </script>
    <main id="app">
        <div class="initial-loading">
            <div>{{ config('app.name') }}</div>
            <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    </main>
    </body>
@stop

