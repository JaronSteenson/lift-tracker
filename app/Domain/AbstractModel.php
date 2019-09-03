<?php

namespace LiftTracker\Domain;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use LiftTracker\Traits\CanUseCustomCollection;


/**
 * The snake_case field names really irked me so I have made this to mostly use camelCase fields in both the code
 * and database.
 */
abstract class AbstractModel extends Model
{
    use CanUseCustomCollection;

    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    public static $snakeAttributes = false;

    /**
     * Get the table associated with the model.
     *
     * @return string
     */
    public function getTable(): string
    {
        if (! isset($this->table)) {
            return Str::plural(class_basename($this));
        }

        return $this->table;
    }

    /**
     * Get the default foreign key name for the model.
     *
     * @return string
     */
    public function getForeignKey(): string
    {
        return lcfirst(class_basename($this)) . ucfirst($this->getKeyName());
    }

    /**
     * @param string $relationName Delete has many relation children where they are not present in memory but are present in the database.
     */
    public function deleteRemovedChildren(string $relationName): void
    {
        /** @var Collection $toBeSaved */
        $toBeSaved = $this->$relationName;

        /** @var HasMany $relation */
        $relation = $this->$relationName();

        /** @var Collection $alreadyPersisted */
        $alreadyPersisted = $relation->get();

        $toBeDeleted = $alreadyPersisted->diff($toBeSaved);

        $idsToDelete = $toBeDeleted->pluck('id')->toArray();

        $relation->getRelated()::destroy($idsToDelete);
    }

}
