<nav class="navbar navbar-expand-lg main-nav-bar">

            <a class="navbar-brand" href="{{ url('/') }}">
                {{ config('app.name', 'Laravel') }}
            </a>

            <a class="navbar-toggler" href="#" data-toggle="collapse" data-target="#js-navbar-options" aria-controls="js-navbar-options" aria-expanded="false" aria-label="Toggle navigation">
                <div class="navbar-burger">
                    <div class="navbar-burger navbar-burger__layer"></div>
                    <div class="navbar-burger navbar-burger__layer"></div>
                    <div class="navbar-burger navbar-burger__layer"></div>
                </div>
            </a>

            <div class="collapse navbar-collapse justify-content-end" id="js-navbar-options">
            <ul class="nav navbar-nav">
                <!-- Authentication Links -->
                @guest
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('login') }}">{{ __('Login') }}</a>
                    </li>
                    <li class="nav-item">
                        @if (Route::has('register'))
                            <a class="nav-link" href="{{ route('register') }}">{{ __('Register') }}</a>
                        @endif
                    </li>
                @else
                    <li class="nav-item dropdown">
                        <a id="nav-dropdown" class="nav-link dropdown-toggle" href="#" role="button"
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>
                            {{ Auth::user()->name }} <span class="caret"></span>
                        </a>

                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="nav-dropdown">
                            <a class="dropdown-item" href="{{ route('logout') }}"
                               onclick="event.preventDefault();
                                document.getElementById('logout-form').submit();">
                                {{ __('Logout') }}
                            </a>

                            <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                @csrf
                            </form>
                        </div>
                    </li>
                @endguest
        </ul>
            </div>
</nav>