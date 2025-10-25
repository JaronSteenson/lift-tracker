import { createVuetify } from 'vuetify';
import { createPinia, setActivePinia } from 'pinia';
import svgIcons from '../vuetify/svgIcons';
import { useAppStore } from '../stores/app';
import { useProgramBuilderStore } from '../stores/programBuilder';
import { useWorkoutSessionStore } from '../stores/workoutSession';
import router from '../router/router';
import { render } from '@testing-library/vue';
import App from '../components/App.vue';
import { pinia } from '../stores';
import fs from 'node:fs';
import { prettyDOM } from '@testing-library/dom';

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

export async function renderApp() {
    setActivePinia(pinia);
    useAppStore().$patch({
        isBootstrapped: true,
        isAuthenticated: true,
        user: {
            name: 'Jaron',
        },
    });
    useProgramBuilderStore().$patch({
        myWorkoutPrograms: [
            {
                uuid: '1',
                name: 'Test workout program',
            },
        ],
    });
    useWorkoutSessionStore().$patch({
        myWorkoutSessions: [
            {
                uuid: '2',
                name: 'Test workout session',
                startedAt: '2020-12-04',
            },
        ],
    });

    await router.push('/');
    // await router.isReady();
    return render(App, {
        global: {
            plugins: [pinia, router, createVuetify()],
            mocks: {
                $svgIcons: svgIcons,
            },
        },
    });
}

export function dump(element = document.body) {
    fs.writeFileSync(
        `./testDump/${Date.now()}.html`,
        prettyDOM(element, 1000000, { highlight: false }) || '',
    );
}
window.dump = dump;
