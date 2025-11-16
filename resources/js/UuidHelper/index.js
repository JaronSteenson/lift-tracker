import { v4 as uuidV4 } from 'uuid';

export default {
    /**
     * Generate a new UUID.
     * @returns {*}
     */
    assign() {
        return uuidV4();
    },

    /**
     * Assign a UUID to an object if it doesn't already have one.
     * @param object
     * @returns {{uuid}|*}
     */
    assignTo(object) {
        if (object.uuid) {
            return object;
        }

        object.uuid = this.assign();

        return object;
    },

    /**
     * Assign a UUID to every element in an array.
     * @param array
     */
    assignToAll(array) {
        array.forEach((object) => this.assignTo(object));
    },

    /**
     * Find an object in an array where it has the specified UUID.
     * The look-up is not deep.
     * @param array
     * @param uuid {string}
     * @returns {*}
     */
    findIn(array, uuid) {
        return array.find((object) => object.uuid === uuid);
    },

    /**
     * Find and replace an object in an array where it has the specified UUID.
     * The look-up is not deep.
     *
     * if It's not found, the item is appended to the end of the list.
     * @param array
     * @param replaceWith
     * @param prependNew {Boolean}
     * @returns {*}
     */
    replaceInCopy(array, replaceWith, prependNew = false) {
        const copy = [...array];

        const index = copy.findIndex(
            (object) => object.uuid === replaceWith.uuid,
        );

        if (index === -1) {
            if (prependNew) {
                return [replaceWith, ...copy];
            }
            return [...copy, replaceWith];
        }

        copy.splice(index, 1, replaceWith);

        return copy;
    },

    replaceMergeInCopy(array, mergeWith, prependNew = false) {
        const copy = [...array];

        const index = copy.findIndex(
            (object) => object.uuid === mergeWith.uuid,
        );

        const replaceWith = { ...array[index], ...mergeWith };

        if (index === -1) {
            if (prependNew) {
                return [replaceWith, ...copy];
            }
            return [...copy, replaceWith];
        }

        copy.splice(index, 1, replaceWith);

        return copy;
    },

    /**
     * Find an object by UUID recursively in an array or object.
     * @param subject {Array | Object}
     * @param uuid {string}
     * @return {null | Object}
     */
    findDeep(subject, uuid) {
        for (const property in subject) {
            const entry = subject[property];

            if (!entry) {
                continue;
            }

            if (typeof entry === 'object') {
                if (entry?.uuid === uuid) {
                    return entry;
                }

                let foundDeep = this.findDeep(entry, uuid);

                if (foundDeep) {
                    return foundDeep;
                } else {
                    continue;
                }
            }

            if (Array.isArray(entry)) {
                let foundDeep = this.findDeep(entry, uuid);

                if (foundDeep) {
                    return foundDeep;
                }
            }
        }

        return null;
    },

    /**
     * Does an object in an array have the specified UUID.
     * @param array
     * @param uuid
     * @return {boolean}
     */
    arrayIncludes(array, uuid) {
        return this.findIn(array, uuid) !== undefined;
    },

    /**
     * Remove an object from an array where it has the specified UUID.
     * @param array
     * @param uuid
     * @returns {boolean} True if the item was found and removed from the array.
     */
    removeFrom(array, uuid) {
        const foundIndex = array.findIndex((object) => object.uuid === uuid);

        if (foundIndex === -1) {
            return false;
        }

        array.splice(foundIndex, 1);

        return true;
    },

    /**
     * Makes a new version of the array with the item removed.
     * @param array
     * @param uuid
     * @returns {*[]}
     */
    removeFromCopy(array, uuid) {
        const copy = [...array];

        this.removeFrom(copy, uuid);

        return copy;
    },
};
