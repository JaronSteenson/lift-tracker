import { beforeEach, describe, expect, test } from 'vitest';
import { getAuthRecoveryRedirectUrl } from '../../../../components/domain/auth/composables/useAuth';

describe('useAuth recovery redirect', () => {
    beforeEach(() => {
        window.history.replaceState({}, '', 'http://localhost:3000/');
    });

    test('keeps localhost origins, including custom dev ports', () => {
        window.history.replaceState(
            {},
            '',
            'http://localhost:3000/program-builder',
        );

        expect(getAuthRecoveryRedirectUrl()).toBe('http://localhost:3000');
    });

    test('redirects direct IP hosts to the production app', () => {
        expect(
            getAuthRecoveryRedirectUrl({
                hostname: '192.168.1.10',
                origin: 'http://192.168.1.10:3000',
            }),
        ).toBe('https://lift-tracker.app');
    });
});
