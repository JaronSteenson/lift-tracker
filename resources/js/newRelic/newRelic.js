import { Agent } from '@newrelic/browser-agent';
import config from '../../../config.json';

export default function initNewRelic() {
    if (!config.newRelicApplicationID) {
        return;
    }

    agent = new Agent({
        info: {
            licenseKey: config.newRelicLicenseKey,
            applicationID: config.newRelicApplicationID,
            beacon: 'bam.eu01.nr-data.net',
            errorBeacon: 'bam.eu01.nr-data.net',
        },
        init: {
            session_replay: {
                enabled: true,
                block_selector: '',
                mask_text_selector: '*',
                sampling_rate: 10.0,
                error_sampling_rate: 100.0,
                mask_all_inputs: true,
                collect_fonts: true,
                inline_images: false,
                inline_stylesheet: true,
                fix_stylesheets: true,
                preload: false,
                mask_input_options: {},
            },
            distributed_tracing: { enabled: true },
            privacy: { cookies_enabled: true },
            ajax: { deny_list: [] },
        },
    });

    return agent;
}

export let agent = null;
