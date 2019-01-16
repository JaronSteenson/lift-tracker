@extends('layouts.app')

@section('content')
    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-2 d-none d-md-block bg-light sidebar">
                <div class="sidebar-sticky">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <i class="fa fa-plus"></i>
                            <i class="fa fa-ban"></i>
                            <a class="nav-link" href="#">
                                Add a program
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
@endsection
