<?php

namespace LiftTracker\Domain\Workouts\UserWorkouts;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 * @property int id
 * @property int user_id
 * @property int workout_program_id
 * @property Carbon created_at
 * @property Carbon updated_at
 */
class UserWorkoutProgram extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $hidden = [
        'user_id', 'workout_scheme_id',
    ];

}
