<?php

namespace LiftTracker\Domain\Workouts;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
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
