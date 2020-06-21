import AppService from "../../api/AppService";

const SLOW_BOOTSTRAP_LOAD_TIME = 1000;

const state = {
    hasLoaded: false,
    slowLoading: false,
    slowLoadingTimeout: null,
    appName: null,
    authenticatedUser: null,
    csrfToken: null,
    afterLoginRoute: null,
};

const getters = {

    isBootstraped(state) {
        return state.hasLoaded;
    },

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
    async fetchAppBootstrapData({state, commit, dispatch}, id) {
        dispatch('startSlowLoadingTimeout');

        const response = await AppService.getBootstrapData(id);

        const newState = { ...state, ...response.data, hasLoaded: true };

        dispatch('clearSlowLoadingTimeout');
        commit('reset', newState);

        return response.data;
    },

    startSlowLoadingTimeout({ commit }) {
        const slowLoadingTimeout = setTimeout(() => {
            commit('reset', {slowLoading: true});
        }, SLOW_BOOTSTRAP_LOAD_TIME)

        commit('reset', { slowLoadingTimeout });
    },

    clearSlowLoadingTimeout({ state }) {
        clearTimeout(state.slowLoadingTimeout);
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

    async signUp({ commit }, { name, email, password }) {
        let response = null;

        try {
            response = await AppService.signUp({ name, email, password });
        } catch (e) {
            console.warn('Sign up failure');
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
