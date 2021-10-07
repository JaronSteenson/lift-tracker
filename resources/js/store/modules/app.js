import AppService from "../../api/AppService";

const SLOW_BOOTSTRAP_LOAD_TIME = 1000;

const state = {
    isBaseBootstraped: false,
    isBootstrapedForAuthedUser: false,
    slowLoading: false,
    slowLoadingTimeout: null,
    appName: null,
    authenticatedUser: null,
    csrfToken: null,
    facebookAppId: null,
    afterLoginUrl: null,
};

const getters = {

    isBaseBootstraped(state) {
        return state.isBaseBootstraped;
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

    shouldShowNoProgramsWelcomeHint(state, getters, rootState, rootGetters) {
        if (!getters.userIsAuthenticated) {
            return false;
        }

        return rootGetters['workoutSession/myWorkoutSessions'].length === 0
            && rootGetters['programBuilder/myWorkoutPrograms'].length === 0
    },

    shouldShowNoProgramsHintStartNewSession(state, getters, rootState, rootGetters) {
        if (!getters.userIsAuthenticated) {
            return false;
        }

        return rootGetters['programBuilder/myWorkoutPrograms'].length === 0
    },

    shouldShowNoSessionsHint(state, getters, rootState, rootGetters) {
        if (!getters.userIsAuthenticated) {
            return false;
        }

        return rootGetters['workoutSession/myWorkoutSessions'].length === 0
            && rootGetters['programBuilder/myWorkoutPrograms'].length > 0
    },

};

const actions = {
    directlyLoadAppBoostrap({ state, commit, dispatch }, data) {
        commit('reset', { ...data.app, isBaseBootstraped: true });

        if (data.app.authenticatedUser !== null) {
            commit('workoutSession/reset', data.workoutSession, { root: true });
            commit('programBuilder/reset', data.programBuilder, { root: true });
        }

        return data;
    },

    async fetchAppBaseBootstrapData({ dispatch }) {
        dispatch('startSlowLoadingTimeout');

        const response = await AppService.getBootstrapData();

        dispatch('directlyLoadAppBoostrap', response.data);

        dispatch('clearSlowLoadingTimeout');
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

        const newState = { ...response.data, isBaseBootstraped: true };

        commit('reset', newState);

        return response;
    },

    async logout({ commit }) {
        const response = await AppService.logout();

        commit('reset', { ...response.data.app, isBaseBootstraped: true });

        commit('workoutSession/restoreDefault', undefined, { root: true });
        commit('programBuilder/restoreDefault', undefined, { root: true });

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
