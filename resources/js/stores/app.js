import { defineStore } from 'pinia';
import axios from 'axios';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import router from '../router/router';
import config from '../../../config.json';
import { rollbar } from '../rollbar/rollbar';
import { useProgramBuilderStore } from './programBuilder';
import { useWorkoutSessionStore } from './workoutSession';

export const LOCAL_STORAGE_KEY = 'store-state--App';

const authorizationParams = {
    detailedResponse: true,
    redirect_uri: `${window.location.origin}`,
    audience: config.auth0.audience,
    scope: 'email',
};

export const useAppStore = defineStore('app', {
    state: () => ({
        isBootstrapped: false,
        isAuthenticated: false,
        auth0Client: null,
        auth0Error: null,
        localOnlyUser: false,
        appName: 'Lift Tracker',
        user: null,
        previousRoute: '/',
        showSessionExpiredModal: false,
        navigationDrawerOpen: false,
        forceRerenderKey: 0,
    }),

    getters: {
        userIsAuthenticated: (state) =>
            Boolean(state.localOnlyUser || state.isAuthenticated),
        userIsLocalOnly: (state) => Boolean(state.localOnlyUser),
        avatarInitials: (state) => {
            const f = state?.user?.name?.charAt(0) ?? '';
            const l = state?.user?.family_name?.charAt(0) ?? '';
            return `${f}${l}`.trim();
        },
        shouldShowNoProgramsWelcomeHint: (state) => {
            if (
                (!state.isAuthenticated && !state.localOnlyUser) ||
                !state.isBootstrapped
            ) {
                return false;
            }
            const workoutSessionStore = useWorkoutSessionStore();
            const programBuilderStore = useProgramBuilderStore();
            return (
                workoutSessionStore.myWorkoutSessions.length === 0 &&
                programBuilderStore.myWorkoutPrograms.length === 0
            );
        },
        shouldShowNoProgramsHintStartNewSession: (state) => {
            if (
                (!state.isAuthenticated && !state.localOnlyUser) ||
                !state.isBootstrapped
            ) {
                return false;
            }
            const programBuilderStore = useProgramBuilderStore();
            return programBuilderStore.myWorkoutPrograms.length === 0;
        },
        shouldShowNoSessionsHint: (state) => {
            if (!state.isAuthenticated && !state.localOnlyUser) {
                return false;
            }
            const workoutSessionStore = useWorkoutSessionStore();
            const programBuilderStore = useProgramBuilderStore();
            return (
                workoutSessionStore.myWorkoutSessions.length === 0 &&
                programBuilderStore.myWorkoutPrograms.length > 0
            );
        },
        shouldShowSessionExpiredModal: (state) => {
            if (state.localOnlyUser) {
                return false;
            }
            return state.showSessionExpiredModal;
        },
        forLocalStorageSave: (state) => ({
            user: state.user,
            localOnlyUser: state.localOnlyUser,
        }),
        fromLocalStorage: () => {
            const app = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            const programBuilderStore = useProgramBuilderStore();
            const workoutSessionStore = useWorkoutSessionStore();

            return {
                app,
                programBuilder: programBuilderStore.fromLocalStorage,
                workoutSession: workoutSessionStore.fromLocalStorage,
            };
        },
    },

    actions: {
        setNavigationDrawerOpen(value) {
            this.navigationDrawerOpen = value;
        },

        forceRerender() {
            this.forceRerenderKey++;
        },

        async bootstrap() {
            await this.bootstrapAuth0();

            const localStorageData = this.fromLocalStorage || {};
            let localOnlyUser = localStorageData?.app?.localOnlyUser ?? false;

            if (localOnlyUser) {
                this.$patch(localStorageData?.app || {});
                const workoutSessionStore = useWorkoutSessionStore();
                const programBuilderStore = useProgramBuilderStore();
                workoutSessionStore.$patch(
                    localStorageData.workoutSession || {},
                );
                programBuilderStore.$patch(
                    localStorageData.programBuilder || {},
                );
                this.$patch({ ...localStorageData?.app, isBootstrapped: true });
                return;
            }

            if (this.isAuthenticated) {
                const programBuilderStore = useProgramBuilderStore();
                const workoutSessionStore = useWorkoutSessionStore();
                programBuilderStore.fetchMyWorkoutPrograms();
                workoutSessionStore.fetchNextPage();
            }

            this.$patch({ localOnlyUser, isBootstrapped: true });
        },

        async bootstrapAuth0() {
            const auth0Client = await createAuth0Client({
                domain: config.auth0.domain,
                clientId: config.auth0.clientId,
                audience: config.auth0.audience,
                cacheLocation: config.auth0.cacheLocation,
            });

            let auth0Error;
            let user;
            let clearQueryParams = false;

            try {
                if (
                    window.location.search.includes('code=') &&
                    window.location.search.includes('state=')
                ) {
                    await auth0Client.handleRedirectCallback();
                    auth0Error = null;
                    clearQueryParams = true;
                }
            } catch (e) {
                auth0Error = e;
                console.error({ auth0Error });
                // Clear invalid callback parameters
                clearQueryParams = true;
                // Clear any stale auth state
                localStorage.removeItem(
                    '@@auth0spajs@@::default::default::http://localhost:8081',
                );
            } finally {
                const isAuthenticated = await auth0Client.isAuthenticated();

                if (isAuthenticated) {
                    user = await auth0Client.getUser();
                    const token = await auth0Client.getTokenSilently({
                        authorizationParams,
                    });
                    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
                }

                this.$patch({
                    isAuthenticated,
                    user,
                    auth0Client,
                    auth0Error,
                });

                if (clearQueryParams) {
                    await router.replace({ query: {} });
                }

                if (rollbar) {
                    rollbar.configure({
                        payload: {
                            person: user,
                        },
                    });
                }
            }
        },

        setPreviousRoute(from) {
            this.previousRoute = from;
        },

        async login() {
            const options = {
                authorizationParams: {
                    ...authorizationParams,
                    screen_hint: 'login',
                },
            };
            await this.auth0Client.loginWithRedirect(options);
        },

        async register() {
            const options = {
                authorizationParams: {
                    ...authorizationParams,
                    screen_hint: 'register',
                },
            };
            await this.auth0Client.loginWithRedirect(options);
        },

        async createLocalAccount() {
            this.$patch({
                user: { name: 'J' },
                localOnlyUser: true,
            });
            this.saveToLocalStorage();
            await router.replace('/');
        },

        async logout() {
            await this.auth0Client.logout();
            this.$patch({
                user: null,
                isAuthenticated: false,
                isBootstrapped: true,
            });
            const workoutSessionStore = useWorkoutSessionStore();
            const programBuilderStore = useProgramBuilderStore();
            workoutSessionStore.$reset();
            programBuilderStore.$reset();
        },

        saveToLocalStorage() {
            if (this.localOnlyUser) {
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify(this.forLocalStorageSave),
                );

                // Also trigger saving for other stores
                const programBuilderStore = useProgramBuilderStore();
                const workoutSessionStore = useWorkoutSessionStore();
                programBuilderStore.saveToLocalStorage();
                workoutSessionStore.saveToLocalStorage();
            }
        },
    },
});
