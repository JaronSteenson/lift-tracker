import { beforeEach, describe, expect, test, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
    Rollbar: vi.fn(),
    error: vi.fn(),
    serviceWorker: {
        addEventListener: vi.fn(),
    },
    config: {
        rollbarAccessToken: 'client-token',
        rollbarCodeVersion: 'abc123',
    },
}));

vi.mock('rollbar', () => ({
    default: hoisted.Rollbar,
}));

vi.mock('../../../../config.json', () => ({
    default: hoisted.config,
}));

describe('initRollbar', () => {
    beforeEach(() => {
        vi.resetModules();
        hoisted.Rollbar.mockReset();
        hoisted.Rollbar.mockImplementation(function createRollbar() {
            return { error: hoisted.error };
        });
        hoisted.error.mockReset();
        hoisted.serviceWorker.addEventListener.mockReset();

        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: hoisted.serviceWorker,
        });
    });

    test('configures source map metadata with the deployed code version', async () => {
        const { default: initRollbar } = await import('../../rollbar/rollbar');

        initRollbar();

        expect(hoisted.Rollbar).toHaveBeenCalledWith({
            accessToken: 'client-token',
            captureUncaught: true,
            captureUnhandledRejections: true,
            ignoredMessages: [
                '\\[unhandledrejection\\] error getting `reason` from event',
                '\\[unhandledrejection\\] error getting `promise` from event',
            ],
            payload: {
                environment: 'test',
                client: {
                    javascript: {
                        source_map_enabled: true,
                        code_version: 'abc123',
                        guess_uncaught_frames: true,
                    },
                },
            },
        });
    });
});
