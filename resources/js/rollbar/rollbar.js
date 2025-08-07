import Rollbar from 'rollbar';
import config from '../../../config.json';

export default function initRollbar() {
    rollbar = new Rollbar({
        accessToken: config.rollbarAccessToken,
        captureUncaught: true,
        captureUnhandledRejections: true,
        environment: process.env.NODE_ENV,
    });

    return rollbar;
}

export let rollbar = null;
