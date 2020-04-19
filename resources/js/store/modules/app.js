import AppService from "../../api/AppService";
import ClientSideId from "../../UuidHelper";

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

        const newState = { ...state, ...response.data, hasLoaded: true };

        commit('reset', newState);

        return response.data;
    },

    async logout({ commit }) {
        const response = await AppService.logout();

        const newState = { ...response.data, hasLoaded: true };

        commit('reset', newState);

        return response;
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
