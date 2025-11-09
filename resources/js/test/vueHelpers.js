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
import { PiniaColada } from '@pinia/colada';
import fs from 'node:fs';
import { prettyDOM } from '@testing-library/dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

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
            plugins: [vuetify, pinia, PiniaColada],
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
    const workoutProgram = {
        uuid: '1',
        name: 'Test workout program',
        workoutProgramRoutines: [
            {
                uuid: '1a',
                name: 'Test routine',
                routineExercises: [
                    {
                        uuid: '1aa',
                        name: 'Test exercise',
                    },
                ],
            },
        ],
    };
    const workoutSession = {
        uuid: '2',
        name: 'Test workout session',
        startedAt: '2020-12-04',
    };

    const handlers = [
        http.post('*', async ({ request }) => {
            return HttpResponse.json(await request.json(), {
                status: 200,
            });
        }),
        http.put('*', async ({ request }) => {
            return HttpResponse.json(await request.json(), {
                status: 200,
            });
        }),
        http.get('*', () => {
            return HttpResponse.json([], { status: 200 });
        }),
    ];

    const server = setupServer(...handlers);
    server.listen();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    setActivePinia(pinia);
    useAppStore().$patch({
        isBootstrapped: true,
        isAuthenticated: true,
        user: {
            name: 'Jaron',
        },
    });
    useProgramBuilderStore().$patch({
        myWorkoutPrograms: [workoutProgram],
    });
    useWorkoutSessionStore().$patch({
        myWorkoutSessions: [workoutSession],
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
const dumpDir = './resources/js/test/dump/';

export function dump(element = document.body) {
    if (typeof element === 'string') {
        fs.writeFileSync(`${dumpDir}${Date.now()}.html`, element);
        return;
    }

    fs.writeFileSync(`${dumpDir}${Date.now()}.html`, JSON.stringify(element));
}

export function dumpElement(element = document.body) {
    if (typeof element === 'string') {
        fs.writeFileSync(`${dumpDir}${Date.now()}.html`, element);
        return;
    }

    fs.writeFileSync(
        `${dumpDir}${Date.now()}.html`,
        prettyDOM(element, 1000000, { highlight: false }) || '',
    );
}

window.dump = dump;
window.dumpElement = dumpElement;
