<?php

namespace LiftTracker\Traits;

trait HasCustomCollection
{

    /**
     * Automatic sets the custom collection class to  "{modelName}Collection"
     * @param array $models
     * @return mixed
     */
    public function newCollection(array $models = Array())
    {
        $customCollectionClass = static::class . 'Collection';
        return new $customCollectionClass($models);
    }

}