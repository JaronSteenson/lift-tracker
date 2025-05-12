@extends('layouts.base')

@section('title')
    <title>{{ config('app.name', 'Lift Tracker') }}</title>
@stop

@section('assets')
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet">
    <link href="{{ asset('js/app.css') }}" rel="stylesheet">
    <link href="{{ asset('js/app-custom.css') }}" rel="stylesheet">
    <script src="{{ mix('js/app.js') }}" defer></script>
@stop

@section('inline-styles')
    <style>
        .initial-loading {
            background: black;
            height: 100vh;
            padding-top: 40vh;
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
                transform: translate(0, 0);
            }
            70% {
                transform: translate(145px, 0);
            }
            100% {
                transform: translate(145px, 0);
            }
        }

        @keyframes lds-ellipsis2 {
            0% {
                transform: translate(0, 0);
            }
            10% {
                transform: translate(0, 0);
            }
            80% {
                transform: translate(145px, 0);
            }
            100% {
                transform: translate(145px, 0);
            }
        }

        @keyframes lds-ellipsis3 {
            0% {
                transform: translate(0, 0);
            }
            20% {
                transform: translate(0, 0);
            }
            90% {
                transform: translate(145px, 0);
            }
            100% {
                transform: translate(145px, 0);
            }
        }

        @keyframes lds-ellipsis4 {
            0% {
                transform: translate(0, 0);
            }
            30% {
                transform: translate(0, 0);
            }
            100% {
                transform: translate(145px, 0);
            }
        }

        .il-container {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        }

        .il-animation-container {
            /* Manual adjustment to line up with "L" and "r" stems. */
            margin-left: -6px;
            width: 145px;
            display: flex;
            flex-direction: row;
        }

        .il-plate-red {
            background-color: #b22e33;
            border-radius: 2px;
            height: 15px;
            width: 5px;
            animation: lds-ellipsis1 2s infinite linear alternate;
            position: relative;
        }

        .il-plate-blue {
            background-color: #365d8f;
            border-radius: 2px;
            height: 15px;
            width: 5px;
            animation: lds-ellipsis2 2s infinite linear alternate;
            position: relative;
            left: -5px;
        }

        .il-plate-yellow {
            background-color: #f7c607;
            border-radius: 2px;
            height: 15px;
            width: 5px;
            animation: lds-ellipsis3 2s infinite linear alternate;
            position: relative;
            left: -10px;
        }

        .il-plate-green {
            background-color: #418054;
            border-radius: 2px;
            height: 15px;
            width: 5px;
            animation: lds-ellipsis4 2s infinite linear alternate;
            position: relative;
            left: -15px;
        }
    </style>
@stop

@section('body')
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
            <div class="il-container">
                <div class="il-animation-container">
                    <div class="il-plate-red"></div>
                    <div class="il-plate-blue"></div>
                    <div class="il-plate-yellow"></div>
                    <div class="il-plate-green"></div>
                </div>
            </div>
        </div>
    </main>
    </body>
@stop

