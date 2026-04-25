import { beforeEach, describe, expect, test, vi } from 'vitest';
import axios from 'axios';
import {
    createLiftTrackerQueryClient,
    setSharedQueryClient,
} from '../../../../queryClient';
import { bootstrapAuth } from '../../../../components/domain/auth/composables/useAuth';

const hoisted = vi.hoisted(() => ({
    isAuthenticated: false,
    user: {
        sub: 'auth0|user-1',
        email: 'user@example.com',
        name: 'Test User',
    },
    initRollbar: vi.fn(),
    rollbar: {
        configure: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@auth0/auth0-spa-js', () => ({
    createAuth0Client: vi.fn(async () => ({
        handleRedirectCallback: vi.fn(),
        isAuthenticated: vi.fn(async () => hoisted.isAuthenticated),
        getUser: vi.fn(async () => hoisted.user),
        getTokenSilently: vi.fn(async () => 'auth-token'),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
    })),
}));

vi.mock('../../../../rollbar/rollbar', () => ({
    default: hoisted.initRollbar,
    rollbar: hoisted.rollbar,
}));

describe('useAuth rollbar bootstrap', () => {
    beforeEach(() => {
        setSharedQueryClient(createLiftTrackerQueryClient());
        hoisted.isAuthenticated = false;
        hoisted.initRollbar.mockReset();
        hoisted.rollbar.configure.mockReset();
        hoisted.rollbar.warning.mockReset();
        hoisted.rollbar.error.mockReset();
        delete axios.defaults.headers.common.Authorization;
        window.history.replaceState({}, '', 'http://localhost:3000/');
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: true,
        });
        sessionStorage.clear();
    });

    test('does not initialize rollbar for unauthenticated sessions', async () => {
        await bootstrapAuth();

        expect(hoisted.initRollbar).not.toHaveBeenCalled();
        expect(hoisted.rollbar.configure).toHaveBeenCalledWith({
            payload: {
                person: null,
            },
        });
    });

    test('initializes rollbar and sets the person after login', async () => {
        hoisted.isAuthenticated = true;

        await bootstrapAuth();

        expect(hoisted.initRollbar).toHaveBeenCalledTimes(1);
        expect(hoisted.rollbar.configure).toHaveBeenCalledWith({
            payload: {
                person: hoisted.user,
            },
        });
        expect(axios.defaults.headers.common.Authorization).toBe(
            'Bearer auth-token',
        );
    });
});
