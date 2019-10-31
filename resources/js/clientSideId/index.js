
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

    findIn(array, cid) {
        return array.find(object => object.cid === cid);
    },

};
