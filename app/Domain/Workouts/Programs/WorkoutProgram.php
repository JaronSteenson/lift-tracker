<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 * @property int id
 * @property string name
 * @property string definition_class
 * @property Carbon created_at
 * @property Carbon updated_at
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
