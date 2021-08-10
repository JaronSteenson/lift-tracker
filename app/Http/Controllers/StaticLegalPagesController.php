<?php

namespace LiftTracker\Http\Controllers;

use Illuminate\View\View;
use LiftTracker\Domain\AppBootstrapData;

class StaticLegalPagesController extends Controller
{

    /**
     * Show the application dashboard.
     *
     * @return View
     */
    public function privacyPolicy(): View
    {
        return view('privacy-policy');
    }
}
