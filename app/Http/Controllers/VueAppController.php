<?php

namespace LiftTracker\Http\Controllers;

use Illuminate\View\View;
use LiftTracker\Domain\AppBootstrapData;

class VueAppController extends Controller
{

    /**
     * Show the application dashboard.
     *
     * @return View
     */
    public function index(): View
    {
        return view('vue-app');
    }
}
