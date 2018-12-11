<?php

namespace LiftTracker;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int userId
 */
class UserWorkoutScheme extends Model
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
