import AppService from "../../api/AppService";
import ClientSideId from "../../ClientSideId";

const state = {
    hasLoaded: false,
    appName: null,
    authenticatedUser: null,
    csrfToken: null,
};

const getters = {

    userIsAuthenticated(state) {
        return state.authenticatedUser !== null;
    },

    getUserAvatarInitial(state) {
        const name = state?.authenticatedUser?.name;

        if (name) {
            return name.charAt(0)
        }
    },

};

const actions = {
    async fetchAppBootstrapData({state, commit}, id) {
        const response = await AppService.getBootstrapData(id);

        const newState = { ...response.data, hasLoaded: true };

        commit('reset', newState);

        return response.data;
    }
};

const mutations = {
    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
