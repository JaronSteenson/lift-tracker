
let cidCounter = 0;

export default {

    assign() {
        return cidCounter++;
    },

    assignTo(object) {
        if (object.cid) {
            return object;
        }

        object.cid = this.assign();

        return object;
    },

    assignToAll(array) {
        array.forEach(object => this.assignTo(object))
    },

    findIn(array, cid) {
        return array.find(object => object.cid === cid);
    },

    /**
     * @param array
     * @param cid
     * @returns {boolean} True if the item was found and removed from the array.
     */
    removeFrom(array, cid) {
        const foundIndex =  array.findIndex(object => object.cid === cid);

        if (foundIndex === -1) {
            return false;
        }

        array.splice(foundIndex, 1);

        return true;
    },

};
