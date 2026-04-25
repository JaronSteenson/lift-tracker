import axios from 'axios';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import config from '../../../../../../config.json';
import initRollbar, { rollbar } from '../../../../rollbar/rollbar';
import { getSharedQueryClient } from '../../../../queryClient';

const PROD_URL = 'https://lift-tracker.app';
const LOCALHOST_HOSTNAME = 'localhost';
const AUTH_QUERY_KEY = ['auth'];
const LOGIN_ERROR_COUNT_STORAGE_KEY = 'auth-login-error-count';

const authorizationParams = {
    detailedResponse: true,
    redirect_uri: `${window.location.origin}`,
    audience: config.auth0.audience,
    scope: 'email',
};

function getStoredLoginErrorCount() {
    const stored = Number.parseInt(
        sessionStorage.getItem(LOGIN_ERROR_COUNT_STORAGE_KEY) || '0',
        10,
    );

    return Number.isNaN(stored) ? 0 : stored;
}

function setStoredLoginErrorCount(count) {
    sessionStorage.setItem(LOGIN_ERROR_COUNT_STORAGE_KEY, String(count));
}

function clearStoredLoginErrorCount() {
    sessionStorage.removeItem(LOGIN_ERROR_COUNT_STORAGE_KEY);
}

function createInitialAuthState() {
    return {
        isBootstrapped: false,
        isAuthenticated: false,
        auth0Client: null,
        auth0Error: null,
        user: null,
        loginErrorCount: getStoredLoginErrorCount(),
    };
}

function ensureAuthState() {
    const queryClient = getSharedQueryClient();
    const currentState = queryClient.getQueryData(AUTH_QUERY_KEY);

    if (currentState) {
        return currentState;
    }

    const initialState = createInitialAuthState();
    queryClient.setQueryData(AUTH_QUERY_KEY, initialState);
    return initialState;
}

function patchAuthState(updater) {
    const queryClient = getSharedQueryClient();

    queryClient.setQueryData(AUTH_QUERY_KEY, (currentState) => {
        const safeCurrentState = currentState || createInitialAuthState();

        return typeof updater === 'function'
            ? updater(safeCurrentState)
            : { ...safeCurrentState, ...updater };
    });
}

export function getAuthState() {
    return ensureAuthState();
}

function setAxiosAuthorizationHeader(token) {
    if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete axios.defaults.headers.common.Authorization;
}

function configureRollbarPerson(person) {
    if (!rollbar) {
        return;
    }

    rollbar.configure({
        payload: {
            person,
        },
    });
}

function clearCurrentQueryParams() {
    const nextUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
}

export function getAuthRecoveryRedirectUrl(location = window.location) {
    return location.hostname === LOCALHOST_HOSTNAME
        ? location.origin
        : PROD_URL;
}

async function reloadToRetryAuth(error) {
    const { loginErrorCount } = getAuthState();

    if (loginErrorCount >= 3) {
        throw error;
    }

    const nextLoginErrorCount = loginErrorCount + 1;
    patchAuthState({
        loginErrorCount: nextLoginErrorCount,
    });
    setStoredLoginErrorCount(nextLoginErrorCount);

    rollbar?.warning(error);
    window.location.replace(getAuthRecoveryRedirectUrl());
}

async function bootstrapAuth0Client() {
    if (!window.isSecureContext) {
        window.location.replace(getAuthRecoveryRedirectUrl());
        return;
    }

    const auth0Client = await createAuth0Client({
        domain: config.auth0.domain,
        clientId: config.auth0.clientId,
        audience: config.auth0.audience,
        cacheLocation: config.auth0.cacheLocation,
    });

    let auth0Error = null;
    let clearQueryParams = false;

    try {
        if (
            window.location.search.includes('code=') &&
            window.location.search.includes('state=')
        ) {
            await auth0Client.handleRedirectCallback();
            clearQueryParams = true;
        }
    } catch (error) {
        console.error(error);
        rollbar?.error(error);
        clearQueryParams = true;
        await reloadToRetryAuth(error);
        return;
    }

    try {
        const isAuthenticated = await auth0Client.isAuthenticated();
        let user = null;

        if (isAuthenticated) {
            user = { ...(await auth0Client.getUser()) };
            initRollbar();
            configureRollbarPerson({ ...user });

            const token = await auth0Client.getTokenSilently({
                authorizationParams,
            });

            setAxiosAuthorizationHeader(token);
        } else {
            setAxiosAuthorizationHeader(null);
            configureRollbarPerson(null);
        }

        patchAuthState({
            isAuthenticated,
            auth0Client,
            auth0Error,
            user,
            loginErrorCount: 0,
        });
        clearStoredLoginErrorCount();

        if (clearQueryParams) {
            clearCurrentQueryParams();
        }
    } catch (error) {
        await reloadToRetryAuth(error);
    }
}

export async function bootstrapAuth() {
    ensureAuthState();
    await bootstrapAuth0Client();
    patchAuthState({ isBootstrapped: true });
}

export async function login() {
    const { auth0Client } = getAuthState();

    await auth0Client?.loginWithRedirect({
        authorizationParams: {
            ...authorizationParams,
            screen_hint: 'login',
        },
    });
}

export async function register() {
    const { auth0Client } = getAuthState();

    await auth0Client?.loginWithRedirect({
        authorizationParams: {
            ...authorizationParams,
            screen_hint: 'register',
        },
    });
}

export async function logout() {
    const currentState = getAuthState();

    await currentState.auth0Client?.logout();
    setAxiosAuthorizationHeader(null);
    configureRollbarPerson(null);

    patchAuthState({
        ...currentState,
        user: null,
        isAuthenticated: false,
        isBootstrapped: true,
        loginErrorCount: 0,
    });
    clearStoredLoginErrorCount();
}

export function setAuthStateForTests(nextState) {
    patchAuthState({
        ...createInitialAuthState(),
        ...nextState,
    });
}

export function useAuth() {
    const { data } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => ensureAuthState(),
        initialData: () => ensureAuthState(),
        staleTime: Infinity,
        gcTime: Infinity,
    });

    return {
        auth: data,
        isBootstrapped: computed(() => data.value.isBootstrapped),
        isAuthenticated: computed(() => data.value.isAuthenticated),
        auth0Client: computed(() => data.value.auth0Client),
        auth0Error: computed(() => data.value.auth0Error),
        user: computed(() => data.value.user),
        userIsAuthenticated: computed(
            () => data.value.user !== null && data.value.isAuthenticated,
        ),
        bootstrapAuth,
        login,
        register,
        logout,
    };
}
