
import { v4 as uuidV4 }  from 'uuid';

export default {

    /**
     * Generate a new uuid.
     * @returns {*}
     */
    assign() {
        return uuidV4();
    },

    /**
     * Assign a uuid to an object if it doesn't already have one.
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
     * Assign a uuid to every element in an array.
     * @param array
     */
    assignToAll(array) {
        array.forEach(object => this.assignTo(object))
    },

    /**
     * Find an object in an array where it has the specified uuid.
     * The look up is not deep.
     * @param array
     * @param uuid
     * @returns {*}
     */
    findIn(array, uuid) {
        return array.find(object => object.uuid === uuid);
    },

    /**
     * Does an object in an array have the specified uuid.
     * @param array
     * @param uuid
     * @return {boolean}
     */
    arrayIncludes(array, uuid) {
        return this.findIn(array, uuid) !== undefined;
    },

    /**
     * Remove an object from an array where it has the specified uuid.
     * @param array
     * @param uuid
     * @returns {boolean} True if the item was found and removed from the array.
     */
    removeFrom(array, uuid) {
        const foundIndex =  array.findIndex(object => object.uuid === uuid);

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
    }

};
