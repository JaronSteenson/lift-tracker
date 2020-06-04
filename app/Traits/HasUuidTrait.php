<?php

namespace LiftTracker\Traits;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;
use InvalidArgumentException;
use Webpatser\Uuid\Uuid;

/**
 * Supports the use of a publicly accessible and client side assignable uuid.
 * An incrementing numeric primary key should still be used privately.
 *
 * Trait HasUuidTrait
 * @package LiftTracker\Traits
 * @property $uuid string
 */
trait HasUuidTrait
{
    /**
     * Execute a query for a single record by ID.
     *
     * @param int|string $uuid
     * @param array $columns
     * @return Model|static
     */
    public function findByUuid($uuid, $columns = ['*'])
    {
        return $this->where('uuid', '=', $uuid)->first($columns);
    }

    /**
     * Trait boot method, run automatic on models using this trait.
     */
    public static function bootHasUuidTrait(): void
    {
        static::creating(static function(Model $model) {
            /** @type $model HasUuidTrait */

            // We allow client side generation of uuid, but will create one if not supplied.
            if (empty($model->uuid)) {
                $model->uuid = static::generateUUID();
                return;
            }

            // Client side supplied uuid must be validated
            if (!Uuid::validate($model->uuid)) {
                Throw new InvalidArgumentException("Invalid uuid supplied when attempting to insert new {$model->getTable()}");
            }
        });

        static::updating(static function (Model $model) {
            /** @type $model HasUuidTrait */

            // We allow client side generation of uuid, but will create one if not supplied.
            if ($model->getOriginal('uuid') !== $model->uuid) {
                Throw new InvalidArgumentException("Attempt to change uuid when updating {$model->getTable()}");
            }
        });
    }

    /**
     * @return string
     * @throws Exception
     */
    protected static function generateUUID(): string
    {
        return Uuid::generate(config('app.uuid_type'))->string;
    }

}
