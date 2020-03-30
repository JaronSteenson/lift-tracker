
// initial state
const state = {
    loggedIn: window.loggedInUser
};

const getters = {

    getLoggedInUser(state) {
        return state.loggedIn;
    },
};

const actions = {};

const mutations = {};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
