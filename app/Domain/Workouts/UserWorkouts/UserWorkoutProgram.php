<?php

namespace LiftTracker\Domain\Workouts\UserWorkouts;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 * @property int userId
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
