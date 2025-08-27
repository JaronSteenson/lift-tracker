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
            stubs: {
                VSparkline: {
                    name: 'VSparkline',
                    template: '<div class="v-sparkline"></div>',
                },
                VDialog: {
                    name: 'VDialog',
                    template: '<div class="v-dialog"><slot /></div>',
                },
                VCard: {
                    name: 'VCard',
                    template: '<div class="v-card"><slot /></div>',
                },
                VCardText: {
                    name: 'VCardText',
                    template: '<div class="v-card__text"><slot /></div>',
                },
                VCardActions: {
                    name: 'VCardActions',
                    template: '<div class="v-card__actions"><slot /></div>',
                },
                VBtn: {
                    name: 'VBtn',
                    template: '<button class="v-btn"><slot /></button>',
                },
            },
        },
    };
}
