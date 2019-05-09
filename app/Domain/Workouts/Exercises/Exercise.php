<?php

namespace LiftTracker\Domain\Workouts\Exercises;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LiftTracker\Traits\CanUseCustomCollection;
use LiftTracker\Traits\HasUUID;
use LiftTracker\User;

/**
 * @mixin Builder
 * @property string id
 * @property string name
 * @property Carbon created_at
 * @property Carbon updated_at
 * @property int user_id
 *
 * For now these are only admin generated. Will want user generated in the future though.
 */
class Exercise extends Model
{
    use HasUUID;
    use CanUseCustomCollection;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name'
    ];

    /**
     * The attributes that should be visible in arrays.
     *
     * @var array
     */
    protected $visible = [
        'name',
        'id',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string', // is a uuid
    ];

    /**
     * Get the user that owns the workout program, null if it is a community program.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Does this user own the workout program, own means they created it.
     * @param User $user
     * @return bool
     */
    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

}
