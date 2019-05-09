<?php

/** @noinspection PhpUndefinedClassInspection */

namespace LiftTracker\Traits;

trait CanUseCustomCollection
{

    /**
     * Automatic sets the custom collection class to  "{modelName}Collection"
     * @param array $models
     * @return mixed
     */
    public function newCollection(array $models = Array())
    {
        $customCollectionClass = static::class . 'Collection';

        if (class_exists($customCollectionClass)) {
            return new $customCollectionClass($models);
        }

        return parent::newCollection($models);
    }

}