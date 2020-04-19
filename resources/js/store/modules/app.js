import AppService from "../../api/AppService";
import ClientSideId from "../../UuidHelper";

const state = {
    hasLoaded: false,
    appName: null,
    authenticatedUser: null,
    csrfToken: null,
    afterLoginRoute: null,
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

    afterLoginRoute(state) {
        if (state?.afterLoginRoute?.name === 'logout') {
            return { name: 'home' };
        }

        return state.afterLoginRoute ?? { name: 'home' };
    },

};

const actions = {
    async fetchAppBootstrapData({state, commit}, id) {
        const response = await AppService.getBootstrapData(id);

        const newState = { ...state, ...response.data, hasLoaded: true };

        commit('reset', newState);

        return response.data;
    },

    setAfterLoginRoute({ commit }, to) {
        commit('setAfterLoginRoute', to);
    },

    async login({ commit }, { email, password }) {
        let response = null;

        try {
            response = await AppService.login({ email, password });
        } catch (e) {
            console.warn('Login failure');
            return false;
        }

        const newState = { ...response.data, hasLoaded: true };

        commit('reset', newState);

        return response;
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
    setAfterLoginRoute(state, to) {
        state.afterLoginRoute = to
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
