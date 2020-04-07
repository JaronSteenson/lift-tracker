<?php

namespace LiftTracker\Domain\Workouts\Exercises;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\CanBeOwnedByUserTrait;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use LiftTracker\Traits\HasUuidTrait;

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
class Exercise extends AbstractModel implements UserOwnershipInterface
{
    use HasUuidTrait;
    use CanBeOwnedByUserTrait;

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

}
