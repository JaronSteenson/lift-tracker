import Rollbar from 'rollbar';
import config from '../../../config.json';

const IGNORED_ROLLBAR_SDK_MESSAGES = [
    '\\[unhandledrejection\\] error getting `reason` from event',
    '\\[unhandledrejection\\] error getting `promise` from event',
];

export default function initRollbar() {
    if (rollbar) {
        return rollbar;
    }

    if (!config.rollbarAccessToken) {
        return;
    }

    const sourceMapConfig = config.rollbarCodeVersion
        ? {
              source_map_enabled: true,
              code_version: config.rollbarCodeVersion,
              guess_uncaught_frames: true,
          }
        : {};

    rollbar = new Rollbar({
        accessToken: config.rollbarAccessToken,
        captureUncaught: true,
        captureUnhandledRejections: true,
        ignoredMessages: IGNORED_ROLLBAR_SDK_MESSAGES,
        payload: {
            environment: process.env.NODE_ENV,
            client: {
                javascript: sourceMapConfig,
            },
        },
    });

    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'sw-error') {
                rollbar.error(event.data.payload, { serviceWorker: true });
            }
        });
    }

    return rollbar;
}

export let rollbar = null;
