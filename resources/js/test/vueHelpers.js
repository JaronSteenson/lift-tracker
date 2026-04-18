import { createVuetify } from 'vuetify';
import svgIcons from '../vuetify/svgIcons';
import router from '../router/router';
import { render } from '@testing-library/vue';
import App from '../components/App.vue';
import fs from 'node:fs';
import { prettyDOM } from '@testing-library/dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { setSharedQueryClient } from '../queryClient';
import { setAuthStateForTests } from '../components/domain/auth/composables/useAuth';

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
    const queryClient = createTestQueryClient();
    setSharedQueryClient(queryClient);

    return {
        global: {
            plugins: [vuetify, [VueQueryPlugin, { queryClient }]],
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

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 0,
                gcTime: 0,
                refetchOnWindowFocus: false,
            },
        },
    });
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
                        numberOfSets: 1,
                        weight: 50,
                        rpe: null,
                        restPeriod: 60,
                        warmUp: 60,
                        position: 0,
                    },
                ],
            },
        ],
    };
    let workoutSession = {
        uuid: '2',
        name: 'Test workout session',
        startedAt: '2020-12-04',
        endedAt: '2020-12-04',
        workoutProgramRoutineUuid: '1a',
        workoutProgramRoutineName: 'Test routine',
        workoutProgramUuid: '1',
        workoutProgramName: 'Test workout program',
        sessionExercises: [],
    };

    function createStartedWorkoutSession(routineUuid) {
        const routine =
            workoutProgram.workoutProgramRoutines.find(
                (item) => item.uuid === routineUuid,
            ) || workoutProgram.workoutProgramRoutines[0];
        const firstExercise = routine.routineExercises[0];

        return {
            uuid: 'started-session-1',
            name: routine.name,
            startedAt: '2020-12-05T10:00:00Z',
            endedAt: null,
            workoutProgramRoutineUuid: routine.uuid,
            workoutProgramRoutineName: routine.name,
            workoutProgramUuid: workoutProgram.uuid,
            workoutProgramName: workoutProgram.name,
            sessionExercises: firstExercise
                ? [
                      {
                          uuid: 'started-exercise-1',
                          name: firstExercise.name,
                          plannedWeight: firstExercise.weight,
                          plannedRpe: firstExercise.rpe,
                          position: firstExercise.position,
                          skipped: false,
                          routineExerciseUuid: firstExercise.uuid,
                          sessionSets: [
                              {
                                  uuid: 'started-set-1',
                                  weight: firstExercise.weight,
                                  reps: null,
                                  rpe: firstExercise.rpe,
                                  position: 0,
                                  startedAt: '2020-12-05T10:00:00Z',
                                  endedAt: null,
                                  restPeriodDuration: firstExercise.restPeriod,
                              },
                          ],
                      },
                  ]
                : [],
        };
    }

    const handlers = [
        http.post('*', async ({ request }) => {
            const payload = await request.json();
            const url = new URL(request.url);

            if (url.pathname.endsWith('/api/workout-sessions/start')) {
                workoutSession = createStartedWorkoutSession(
                    payload.routineUuid,
                );

                return HttpResponse.json(workoutSession, {
                    status: 200,
                });
            }

            if (url.pathname.includes('/api/workout-sessions')) {
                workoutSession = payload;
            }

            return HttpResponse.json(payload, {
                status: 200,
            });
        }),
        http.put('*', async ({ request }) => {
            const payload = await request.json();
            const url = new URL(request.url);

            if (url.pathname.includes('/api/workout-sessions')) {
                workoutSession = payload;
            }

            return HttpResponse.json(payload, {
                status: 200,
            });
        }),
        http.get('*', ({ request }) => {
            const url = new URL(request.url);

            if (url.pathname.endsWith('/api/workout-programs')) {
                return HttpResponse.json([workoutProgram], { status: 200 });
            }

            if (url.pathname === '/api/workout-sessions') {
                return HttpResponse.json(
                    {
                        items: [workoutSession],
                        totalCount: 1,
                        pageIndex: 1,
                        pageSize: 10,
                        totalPages: 1,
                        hasPreviousPage: false,
                        hasNextPage: false,
                    },
                    { status: 200 },
                );
            }

            if (url.pathname === '/api/workout-sessions/in-progress') {
                return HttpResponse.json(
                    workoutSession.startedAt && !workoutSession.endedAt
                        ? workoutSession
                        : null,
                    { status: 200 },
                );
            }

            if (
                url.pathname.endsWith(
                    `/api/workout-sessions/${workoutSession.uuid}`,
                )
            ) {
                return HttpResponse.json(workoutSession, { status: 200 });
            }

            if (
                url.pathname.includes('/api/workout-sessions/by-set/') &&
                workoutSession.sessionExercises
                    ?.flatMap((exercise) => exercise.sessionSets || [])
                    .some((set) => url.pathname.endsWith(`/${set.uuid}`))
            ) {
                return HttpResponse.json(workoutSession, { status: 200 });
            }

            if (
                url.pathname.includes('/api/workout-programs/by-routine/') &&
                workoutProgram.workoutProgramRoutines.some((routine) =>
                    url.pathname.endsWith(`/${routine.uuid}`),
                )
            ) {
                return HttpResponse.json(workoutProgram, { status: 200 });
            }

            return HttpResponse.json([], { status: 200 });
        }),
    ];

    const server = setupServer(...handlers);
    server.listen();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    const queryClient = createTestQueryClient();
    setSharedQueryClient(queryClient);
    setAuthStateForTests({
        isBootstrapped: true,
        isAuthenticated: true,
        user: {
            name: 'Jaron',
        },
    });
    await router.push('/');
    // await router.isReady();

    return render(App, {
        global: {
            plugins: [
                router,
                createVuetify(),
                [VueQueryPlugin, { queryClient }],
            ],
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
