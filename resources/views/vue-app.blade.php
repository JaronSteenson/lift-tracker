<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <title>{{ config('app.name', 'Lift Tracker') }}</title>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- JS app bundle -->
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- App icons -->
    <link rel="apple-touch-icon" sizes="57x57" href="/app-icons/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/app-icons/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/app-icons/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/app-icons/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/app-icons/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/app-icons/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/app-icons/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/app-icons/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/app-icons/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/app-icons/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/app-icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/app-icons/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/app-icons/favicon-16x16.png">

    <!-- Progressive web app manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="msapplication-TileColor" content="{{ config('app.brand_color_dark') }}">
    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
    <meta name="theme-color" content="{{ config('app.brand_color_dark') }}">
    <style>
        body {
            background: {{ config('app.brand_color_dark') }};
        }
        .initial-loading {
            display: block;
            margin-top: 40%;
            text-align: center;
            color: white;
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
            background: #fff;
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
</head>
<body data-app-bootstrap="{{ json_encode($appBootstrapData) }}">
<main id="app">
    <div class="initial-loading">
        <div>{{ config('app.name') }}</div>
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
</main>
</body>
</html>

