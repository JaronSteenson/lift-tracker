import AppService from '../../api/AppService';
import { addMinutes, isAfter } from 'date-fns';

export const LOCAL_STORAGE_KEY = 'store-state--App';

const state = {
    isBootstrapped: false,
    appName: 'Lift Tracker',
    authenticatedUser: null,
    csrfToken: null,
    facebookAppId: null,
    afterLoginUrl: null,
    previousRoute: '/',
    /**
     * Session lifetime in minutes.
     * @type ?number
     */
    sessionLifetime: null,
    /**
     * Roughly when the session will expire.
     * @type ?Date
     */
    sessionExpiryTime: null,
    /**
     * We can force the session-expired modal from either a bad ajax response or from our expiry check interval.
     * @type Boolean
     */
    showSessionExpiredModal: false,
    navigationDrawerOpen: false,
};

const getters = {
    isBootstrapped(state) {
        return state.isBootstrapped;
    },

    userIsAuthenticated(state) {
        return Boolean(
            state.authenticatedUser &&
                (state.authenticatedUser.localOnly ||
                    state.authenticatedUser.emailVerifiedAt)
        );
    },

    userIsLocalOnly(state) {
        return Boolean(
            state.authenticatedUser && state.authenticatedUser.localOnly
        );
    },

    getUserAvatarInitial(state) {
        const f = state?.authenticatedUser?.firstName?.charAt(0) ?? '';
        const l = state?.authenticatedUser?.lastName?.charAt(0) ?? '';

        return `${f}${l}`.trim();
    },

    navigationDrawerOpen(state) {
        return state.navigationDrawerOpen;
    },

    afterLoginUrl(state) {
        if (state?.afterLoginUrl?.name === 'logout') {
            return { name: 'HomePage' };
        }

        return state.afterLoginUrl ?? { name: 'HomePage' };
    },

    shouldShowNoProgramsWelcomeHint(state, getters, rootState, rootGetters) {
        if (!getters.userIsAuthenticated) {
            return false;
        }

        return (
            rootState.workoutSession.myWorkoutSessions.length === 0 &&
            rootGetters['programBuilder/myWorkoutPrograms'].length === 0
        );
    },

    shouldShowNoProgramsHintStartNewSession(
        state,
        getters,
        rootState,
        rootGetters
    ) {
        if (!getters.userIsAuthenticated) {
            return false;
        }

        return rootGetters['programBuilder/myWorkoutPrograms'].length === 0;
    },

    shouldShowNoSessionsHint(state, getters, rootState, rootGetters) {
        if (!getters.userIsAuthenticated) {
            return false;
        }

        return (
            rootState.workoutSession.myWorkoutSessions.length === 0 &&
            rootGetters['programBuilder/myWorkoutPrograms'].length > 0
        );
    },

    sessionIsExpired: (state) => () => {
        return isAfter(new Date(), state.sessionExpiryTime);
    },

    showSessionExpiredModal(state, getters) {
        if (getters.userIsLocalOnly) {
            return false;
        }

        return state.showSessionExpiredModal;
    },

    forLocalStorageSave({ authenticatedUser }) {
        return {
            authenticatedUser,
        };
    },

    fromLocalStorage(state, getters, rootState, rootGetters) {
        const app = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        const programBuilder = rootGetters['programBuilder/fromLocalStorage'];
        const workoutSession = rootGetters['workoutSession/fromLocalStorage'];

        return {
            app,
            programBuilder,
            workoutSession,
        };
    },
};

const actions = {
    setNavigationDrawerOpen({ commit }, value) {
        commit('reset', {
            navigationDrawerOpen: value,
        });
    },
    async boostrap({ commit, getters }, data = null) {
        const localStorageData = getters.fromLocalStorage;

        let isAuthed = false;
        let localOnlyUser = localStorageData.app?.authenticatedUser?.localOnly;

        if (localOnlyUser) {
            data = localStorageData;
        } else if (!data) {
            data = (await AppService.getBootstrapData()).data;
            isAuthed = data.app.authenticatedUser !== null;
        }

        commit('reset', { ...data.app, isBootstrapped: true });

        if (isAuthed || localOnlyUser) {
            commit('workoutSession/reset', data.workoutSession, {
                root: true,
            });
            commit('programBuilder/reset', data.programBuilder, {
                root: true,
            });
        }

        if (isAuthed) {
            data.app.sessionExpiryTime = addMinutes(
                new Date(),
                data.app.sessionLifetime
            );

            const sessionExpiryCheckInterval = setInterval(async () => {
                if (getters.sessionIsExpired()) {
                    // We need to re-fetch the xsrf token before the user trys to re-auth.
                    const boostrapDataResponse =
                        await AppService.getBootstrapData();
                    const csrfToken = boostrapDataResponse.data.app.csrfToken;

                    commit('reset', {
                        csrfToken,
                        showSessionExpiredModal: true,
                    });

                    clearInterval(sessionExpiryCheckInterval);
                }
            }, 60 * 1000);
        }

        return data;
    },

    async login({ commit, getters }, { email, password }) {
        const response = await AppService.login({ email, password });

        const data = response.data;
        if (response.status >= 400) {
            return response;
        }

        if (getters.userIsLocalOnly) {
            localStorage.clear();
        }

        commit('reset', { ...data.app, isBootstrapped: true });
        commit('workoutSession/reset', data.workoutSession, { root: true });
        commit('programBuilder/reset', data.programBuilder, { root: true });

        return response;
    },

    async register(
        { commit },
        { firstName, lastName, email, password, passwordConfirm }
    ) {
        const response = await AppService.register({
            firstName,
            lastName,
            email,
            password,
            passwordConfirm,
        });
        commit('reset', { ...response.data.app, isBootstrapped: true });
        return response;
    },

    async sendPasswordResetEmail(_, email) {
        return await AppService.sendPasswordResetEmail({
            email,
        });
    },

    async resetPassword(
        { dispatch },
        { email, password, passwordConfirm, token }
    ) {
        const response = await AppService.resetPassword({
            email,
            password,
            passwordConfirm,
            token,
        });

        if (response.status === 200) {
            dispatch('boostrap', response.data);
        }

        return response;
    },

    setAfterLoginUrl({ commit }, to) {
        commit('setAfterLoginUrl', to);
    },

    setPreviousRoute({ commit }, from) {
        commit('setPreviousRoute', from);
    },

    async logout({ commit }) {
        const response = await AppService.logout();

        commit('reset', { ...response.data.app, isBootstrapped: true });

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

    createLocalAccount({ commit, dispatch }) {
        commit('reset', {
            authenticatedUser: {
                firstName: 'M',
                lastName: 'E',
                localOnly: true,
            },
        });
        dispatch('saveToLocalStorage');
    },

    saveToLocalStorage({ getters }) {
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(getters.forLocalStorageSave)
        );
    },
};

const mutations = {
    reset(state, newState) {
        Object.keys(newState || {}).forEach((key) => {
            state[key] = newState[key];
        });
    },

    setAfterLoginUrl(state, to) {
        state.afterLoginUrl = to;
    },

    setPreviousRoute(state, from) {
        state.previousRoute = from;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
