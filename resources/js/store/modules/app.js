import AppService from "../../api/AppService";

const SLOW_BOOTSTRAP_LOAD_TIME = 1000;

const state = {
    hasLoaded: false,
    slowLoading: false,
    slowLoadingTimeout: null,
    appName: null,
    authenticatedUser: null,
    csrfToken: null,
    facebookAppId: null,
    afterLoginUrl: null,
};

const getters = {

    isBootstraped(state) {
        return state.hasLoaded;
    },

    userIsAuthenticated(state) {
        return state.authenticatedUser !== null;
    },

    getUserAvatarInitial(state) {
        const f = state?.authenticatedUser?.firstName?.charAt(0) ?? '';
        const l = state?.authenticatedUser?.lastName?.charAt(0) ?? '';

        return `${f}${l}`.trim();
    },

    afterLoginUrl(state) {
        if (state?.afterLoginUrl?.name === 'logout') {
            return { name: 'home' };
        }

        return state.afterLoginUrl ?? { name: 'home' };
    },

};

const actions = {
    directlyLoadAppBoostrap({state, commit, dispatch}, data) {
        const newState = { ...state, ...data, hasLoaded: true };

        commit('reset', newState);

        return data;
    },

    async fetchAppBootstrapData({state, commit, dispatch}) {
        dispatch('startSlowLoadingTimeout');

        const response = await AppService.getBootstrapData();
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

    setAfterLoginUrl({ commit }, to) {
        commit('setAfterLoginUrl', to);
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

    setAfterLoginUrl(state, to) {
        state.afterLoginUrl = to
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
