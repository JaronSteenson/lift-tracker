<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use LiftTracker\Traits\HasUUID;

/**
 * @mixin Builder
 * @property int id
 * @property string name
 * @property Carbon created_at
 * @property Carbon updated_at
 *
 * For now these are only admin generated. Will want user generated in the future though.
 */
class WorkoutProgram extends Model
{
    use HasUUID;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name'
    ];

}
