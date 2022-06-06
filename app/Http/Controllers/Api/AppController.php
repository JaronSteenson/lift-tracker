<?php

namespace LiftTracker\Http\Controllers\Api;

use LiftTracker\Domain\AppBootstrapData;
use LiftTracker\Http\Controllers\Controller;

class AppController extends Controller
{

    public function index(): AppBootstrapData
    {
        return new AppBootstrapData();
    }

}
