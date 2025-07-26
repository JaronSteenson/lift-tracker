import axios from 'axios';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import router from '../../router/router';
import authConfig from '../../../../auth_config.js';

export const LOCAL_STORAGE_KEY = 'store-state--App';

const authorizationParams = {
    detailedResponse: true,
    redirect_uri: `${window.location.origin}`,
    audience: authConfig.audience,
    scope: 'email',
};

const state = {
    isBootstrapped: false,
    isAuthenticated: false,
    auth0Client: null,
    auth0Error: null,
    localOnlyUser: false,
    appName: 'Lift Tracker',
    user: null,
    previousRoute: '/',
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
        return Boolean(state.localOnlyUser || state.isAuthenticated);
    },

    userIsLocalOnly(state) {
        return Boolean(state.localOnlyUser);
    },

    avatarInitials(state) {
        const f = state?.user?.name?.charAt(0) ?? '';
        const l = state?.user?.family_name?.charAt(0) ?? '';

        return `${f}${l}`.trim();
    },

    navigationDrawerOpen(state) {
        return state.navigationDrawerOpen;
    },

    shouldShowNoProgramsWelcomeHint(state, getters, rootState, rootGetters) {
        if (!getters.userIsAuthenticated || !state.isBootstrapped) {
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
        if (!getters.userIsAuthenticated || !state.isBootstrapped) {
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

    showSessionExpiredModal(state, getters) {
        if (getters.userIsLocalOnly) {
            return false;
        }

        return state.showSessionExpiredModal;
    },

    forLocalStorageSave({ user, localOnlyUser }) {
        return {
            user,
            localOnlyUser,
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
    async boostrap({ state, commit, getters, dispatch }) {
        await dispatch('boostrapAuth0');

        const localStorageData = getters.fromLocalStorage || {};
        let localOnlyUser = localStorageData?.app?.localOnlyUser ?? false;

        if (localOnlyUser) {
            commit('reset', localStorageData?.app);
            commit('workoutSession/reset', localStorageData.workoutSession, {
                root: true,
            });
            commit('programBuilder/reset', localStorageData.programBuilder, {
                root: true,
            });
            commit('reset', { ...localStorageData?.app, isBootstrapped: true });
            return;
        }

        if (state.isAuthenticated) {
            dispatch(
                'programBuilder/fetchMyWorkoutPrograms',
                {},
                {
                    root: true,
                }
            );
            dispatch(
                'workoutSession/fetchNextPage',
                {},
                {
                    root: true,
                }
            );
        }

        commit('reset', { localOnlyUser, isBootstrapped: true });
    },

    async boostrapAuth0({ commit }) {
        // Create a new instance of the SDK client using members of the given options object
        const auth0Client = await createAuth0Client({
            ...authConfig,
        });
        let auth0Error;
        let user;
        try {
            // If the user is returning to the app after authentication.
            if (
                window.location.search.includes('code=') &&
                window.location.search.includes('state=')
            ) {
                console.log('handleRedirectCallback');
                // handle the redirect and retrieve tokens
                await auth0Client.handleRedirectCallback();
                auth0Error = null;
            }
        } catch (e) {
            auth0Error = e;
            console.error({ auth0Error });
        } finally {
            // Initialize our internal authentication state
            const isAuthenticated = await auth0Client.isAuthenticated();

            if (isAuthenticated) {
                user = await auth0Client.getUser();
                if (authConfig.tokenFetchIsSilent) {
                    const token = await auth0Client.getTokenSilently({
                        authorizationParams,
                    });
                    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
                } else {
                    const token = await auth0Client.getTokenWithPopup({
                        authorizationParams,
                    });
                    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
                }
            }

            commit('reset', {
                isAuthenticated,
                user,
                auth0Client,
                auth0Error,
            });
        }
    },

    setPreviousRoute({ commit }, from) {
        commit('setPreviousRoute', from);
    },

    async login({ state }) {
        const options = {
            authorizationParams: {
                ...authorizationParams,
                screen_hint: 'login',
            },
        };

        await state.auth0Client.loginWithRedirect(options);
    },

    async register({ state }) {
        const options = {
            authorizationParams: {
                ...authorizationParams,
                screen_hint: 'register',
            },
        };

        await state.auth0Client.loginWithRedirect(options);
    },

    async createLocalAccount({ commit, dispatch }) {
        commit('reset', {
            user: {
                name: 'J',
            },
            localOnlyUser: true,
        });
        dispatch('saveToLocalStorage');
        await router.replace('/');
    },

    async logout({ state, commit }) {
        await state.auth0Client.logout();
        commit('reset', { user: null, isBootstrapped: true });
        commit('workoutSession/restoreDefault', undefined, { root: true });
        commit('programBuilder/restoreDefault', undefined, { root: true });
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
