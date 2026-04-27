import Rollbar from 'rollbar';
import config from '../../../config.json';

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
