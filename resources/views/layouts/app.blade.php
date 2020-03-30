<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Font Awesome--}}
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
          integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Preload data and js config -->
    <script>
        {{--    Alow this to be unset, for things like the built in login system.    --}}
            window.apiBaseUrl = <?= json_encode($apiBaseUrl ?? null) ?>;
            window.loggedInUser = <?= json_encode($loggedInUser ?? null) ?>;
    </script>
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet" type="text/css">

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
</head>
<body>
    <v-app id="app">
        <v-navigation-drawer app>
        </v-navigation-drawer>

        <v-app-bar app title>
            <v-toolbar-title>{{ config('app.name') }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-menu
                transition="slide-y-transition"
                bottom
                offset-y
            >
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                        <v-avatar color="purple">
                            <span class="white--text headline">JS</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item>
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-content>
            <v-container fluid>
                {{--        content is simply the router-view for full vue pages      --}}
                @yield('content')
            </v-container>
        </v-content>
    </v-app>
</body>
</html>
