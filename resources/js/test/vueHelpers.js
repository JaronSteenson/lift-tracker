// import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { createPinia } from 'pinia';
import svgIcons from '../vuetify/svgIcons';

export function prepareForLocalVueMount() {
    ensureVuetifyAppDivExists();
    return localMountOptions();
}

function ensureVuetifyAppDivExists() {
    if (document.querySelector('[data-app]') !== null) {
        return;
    }

    const app = document.createElement('div');
    app.setAttribute('data-app', '');
    document.body.append(app);
}

function localMountOptions() {
    const vuetify = createVuetify();
    const pinia = createPinia();

    return {
        global: {
            plugins: [vuetify, pinia],
            mocks: {
                $svgIcons: svgIcons,
            },
        },
    };
}
