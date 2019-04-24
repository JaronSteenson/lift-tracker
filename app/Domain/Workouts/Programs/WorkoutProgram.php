<?php

namespace LiftTracker\Domain\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LiftTracker\Domain\Users\DefaultUserOwnershipCheck;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Traits\HasCustomCollection;
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
class WorkoutProgram extends Model implements UserOwnershipInterface
{
    use HasUUID;
    use HasCustomCollection;
    use DefaultUserOwnershipCheck;

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
        'id' => 'string', //is a uuid
    ];

    /**
     * Get the user that owns the workout program, null if it is a community program.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
