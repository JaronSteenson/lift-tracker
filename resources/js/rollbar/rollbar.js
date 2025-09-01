import Rollbar from 'rollbar';
import config from '../../../config.json';

export default function initRollbar() {
    if (!config.rollbarAccessToken) {
        return;
    }

    rollbar = new Rollbar({
        accessToken: config.rollbarAccessToken,
        captureUncaught: true,
        captureUnhandledRejections: true,
        environment: process.env.NODE_ENV,
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
