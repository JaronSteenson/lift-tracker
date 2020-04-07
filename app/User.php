<?php

namespace LiftTracker;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;

/**
 * Class User
 * @property int id
 * @package LiftTracker
 * @mixin Builder
 */
class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $visible = [
        'name', 'email',
    ];

    /**
     * Get the workout out programs created and owned by this user.
     * These concepts are likely to be separated in the future.
     */
    public function workoutPrograms(): HasMany
    {
        return $this->hasMany(WorkoutProgram::class, 'userId');
    }

    public function findWorkoutPrograms(): Collection
    {
        return $this->workoutPrograms()->orderBy('name')->get();
    }
}
