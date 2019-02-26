<?php

namespace LiftTracker\Traits;

use Webpatser\Uuid\Uuid;

trait HasUUID
{

    /**
     * Trait boot method, run automatic on models using this trait
     */
    public static function bootHasUUID()
    {
        static::creating(function($model) {

            if(empty($model->id)){
                $model->id = static::generateUUID();
            }
        });
    }

    /**
     * @return string
     * @throws \Exception
     */
    protected static function generateUUID(): string
    {
        return Uuid::generate(config('app.uuid_type'))->string;
    }

    /**
     * Do not try to increment the uuid
     * @return bool
     */
    public function getIncrementing()
    {
        return false;
    }

    public function getKeyType()
    {
        return 'string';
    }

}