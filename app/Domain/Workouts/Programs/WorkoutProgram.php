<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 * @property int userId
 */
class WorkoutProgram extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $hidden = [
        'user_id', 'definition_class', 'created_at', 'updated_at'
    ];

}
