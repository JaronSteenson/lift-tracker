import AppService from "../../api/AppService";
import { addMinutes, isAfter } from 'date-fns'

const state = {
    isBaseBootstraped: false,
    appName: null,
    authenticatedUser: null,
    csrfToken: null,
    facebookAppId: null,
    afterLoginUrl: null,
    /**
     * Session lifetime in minutes.
     * @type ?number
     */
    sessionLifetime: null,
    /**
     * Roughly when the session will expire.
     * @type ?DateTime
     */
    sessionExpiryTime: null,
    /**
     * We can force the session expired modal from either a bad ajax response or from our expiry check interval.
     * @type Boolean
     */
    showSessionExpiredModal: false,
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
            return { name: 'HomePage'};
        }

        return state.afterLoginUrl ?? { name: 'HomePage'};
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

    sessionIsExpired: (state) => () => {
        return isAfter(new Date(), state.sessionExpiryTime);
    },

    showSessionExpiredModal(state) {
        return state.showSessionExpiredModal;
    },

};

const actions = {
    directlyLoadAppBoostrap({ state, commit, dispatch, getters }, data) {
        const isAuthed = data.app.authenticatedUser !== null;

        if (isAuthed) {
            data.app.sessionExpiryTime = addMinutes(new Date(), data.app.sessionLifetime);

            const sessionExpiryCheckInterval = setInterval(async () => {
                 if (getters.sessionIsExpired()) {
                    // We need to re-fetch the xsrf token before the user trys to re-auth.
                    const boostrapDataResponse = await AppService.getBootstrapData();
                    const csrfToken = boostrapDataResponse.data.app.csrfToken;

                    commit('reset', {
                        csrfToken,
                        showSessionExpiredModal: true,
                    });

                    clearInterval(sessionExpiryCheckInterval);
                }
            }, 60 * 1000);
        }

        commit('reset', { ...data.app, isBaseBootstraped: true });

        if (isAuthed) {
            commit('workoutSession/reset', data.workoutSession, { root: true });
            commit('programBuilder/reset', data.programBuilder, { root: true });
        }

        return data;
    },

    setAfterLoginUrl({ commit }, to) {
        commit('setAfterLoginUrl', to);
    },

    async logout({ commit }) {
        const response = await AppService.logout();

        commit('reset', { ...response.data.app, isBaseBootstraped: true });

        commit('workoutSession/restoreDefault', undefined, { root: true });
        commit('programBuilder/restoreDefault', undefined, { root: true });

        return response;
    },

    extendSessionExpiry({ state, commit }) {
        commit('reset', {
            sessionExpiryTime: addMinutes(new Date(), state.sessionLifetime),
            showSessionExpiredModal: false,
        });
    },

    async expireSession({ commit }) {
        // We need to re-fetch the xsrf token before the user trys to re-auth.
        const boostrapDataResponse = await AppService.getBootstrapData();
        const csrfToken = boostrapDataResponse.data.app.csrfToken;

        commit('reset', {
            csrfToken,
            sessionExpiryTime: new Date(),
            showSessionExpiredModal: true,
        });
   },
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
