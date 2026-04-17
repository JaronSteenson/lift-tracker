import { shallowMount } from '@vue/test-utils';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { ref } from 'vue';
import SetOverview from '../../../../components/domain/workoutSessions/SetOverview.vue';
import { prepareForLocalVueMount } from '../../../vueHelpers';
import { useRouter } from 'vue-router';
import {
    useUpdateWorkoutSession,
    useWorkoutSession,
} from '../../../../components/domain/workoutSessions/composibles/workoutSessionQueries';

const isSetChangeTransitioning = ref(false);

vi.mock('vue-router', async () => {
    const actual = await vi.importActual('vue-router');
    return {
        ...actual,
        useRouter: vi.fn(),
    };
});

vi.mock(
    '../../../../components/domain/workoutSessions/composibles/workoutSessionQueries',
    () => ({
        useWorkoutSession: vi.fn(),
        useUpdateWorkoutSession: vi.fn(),
        useWorkoutSessionSaveState: () => ({
            isPending: ref(false),
            isError: ref(false),
            submittedAt: ref(0),
        }),
        useSetChangeTransition: () => ({
            isSetChangeTransitioning,
        }),
        startSetChangeTransition: vi.fn(() => {
            isSetChangeTransitioning.value = true;
        }),
        finishSetChangeTransition: vi.fn(() => {
            isSetChangeTransitioning.value = false;
        }),
        useExerciseHistory: () => ({
            exerciseHistory: ref([]),
            isPending: ref(false),
        }),
        getSet: vi.fn(),
        getExerciseBySet: vi.fn(),
        isInProgressWorkout: vi.fn(),
        getPreviousSet: vi.fn(),
        getNextSet: vi.fn(),
        getCurrentSetForInProgressWorkout: vi.fn(),
        getPreviousExerciseLastSet: vi.fn(),
        getNextExerciseFirstSet: vi.fn(),
        isFirstSetOfWorkout: vi.fn(),
        isLastSetOfWorkout: vi.fn(),
        isLastSetOfExercise: vi.fn(),
        getWeightForCurrentSet: vi.fn(),
        getRepsForCurrentSet: vi.fn(),
        getRestPeriodForCurrentSet: vi.fn(),
        getWarmUpForCurrentExercise: vi.fn(),
        isDuringWarmUp: vi.fn(),
        isDuringRestPeriod: vi.fn(),
        isWarmUpStarted: vi.fn(),
        isWarmUpEnded: vi.fn(),
        isRestPeriodStarted: vi.fn(),
        isRestPeriodFinished: vi.fn(),
    }),
);

vi.mock('vuetify', async () => {
    const actual = await vi.importActual('vuetify');
    return {
        ...actual,
        useDisplay: () => ({
            xs: ref(false),
            smAndUp: ref(true),
        }),
    };
});

vi.mock(
    '../../../../components/domain/auth/composables/useAuth',
    () => ({
        useAuth: () => ({
            userIsAuthenticated: ref(true),
        }),
    }),
);

const mountOptions = prepareForLocalVueMount();

describe('SetOverview - Navigation functionality', () => {
    let mockRouterPush;
    let mockRouterReplace;
    let advanceToNextSet;
    let skipExerciseAndStartSet;
    let skipExerciseAndEndWorkout;
    let workoutSession;

    beforeEach(async () => {
        isSetChangeTransitioning.value = false;
        mockRouterPush = vi.fn().mockResolvedValue();
        mockRouterReplace = vi.fn().mockResolvedValue();
        advanceToNextSet = vi.fn().mockResolvedValue();
        skipExerciseAndStartSet = vi.fn().mockResolvedValue();
        skipExerciseAndEndWorkout = vi.fn().mockResolvedValue();
        workoutSession = {
            uuid: 'session-uuid',
            createdAt: '2026-04-01T10:00:00Z',
            startedAt: '2026-04-01T10:00:00Z',
            endedAt: null,
            sessionExercises: [
                {
                    uuid: 'exercise-uuid',
                    name: 'Bench Press',
                    skipped: false,
                    routineExerciseUuid: 'routine-exercise-uuid',
                    sessionSets: [
                        {
                            uuid: 'test-set-uuid',
                            position: 0,
                            startedAt: '2026-04-01T10:00:00Z',
                            endedAt: null,
                        },
                        {
                            uuid: 'next-set-uuid',
                            position: 1,
                            startedAt: null,
                            endedAt: null,
                        },
                    ],
                },
            ],
        };

        vi.mocked(useRouter).mockReturnValue({
            push: mockRouterPush,
            replace: mockRouterReplace,
        });

        vi.mocked(useWorkoutSession).mockReturnValue({
            workoutSession: ref(workoutSession),
            isPending: ref(false),
            error: ref(null),
        });
        vi.mocked(useUpdateWorkoutSession).mockReturnValue({
            updateSetWeight: vi.fn(),
            updateSetReps: vi.fn(),
            updateExerciseWarmUpDuration: vi.fn(),
            updateSetRestPeriodDuration: vi.fn(),
            updateExerciseNotes: vi.fn(),
            updateExerciseSkipped: vi.fn(),
            skipExerciseAndStartSet,
            skipExerciseAndEndWorkout,
            advanceToNextSet,
            startSet: vi.fn(),
            endSet: vi.fn(),
            startWarmUp: vi.fn(),
            endWarmUp: vi.fn(),
            startRestPeriod: vi.fn(),
            endRestPeriod: vi.fn(),
            resetWarmUp: vi.fn(),
            resetRestPeriod: vi.fn(),
            endWorkout: vi.fn(),
        });

        const queries = await import(
            '../../../../components/domain/workoutSessions/composibles/workoutSessionQueries'
        );

        vi.mocked(queries.getSet).mockImplementation((workoutSession, uuid) =>
            workoutSession.sessionExercises[0].sessionSets.find(
                (set) => set.uuid === uuid,
            ),
        );
        vi.mocked(queries.getExerciseBySet).mockImplementation(
            (workoutSession, uuid) =>
                workoutSession.sessionExercises.find((exercise) =>
                    exercise.sessionSets.some((set) => set.uuid === uuid),
                ),
        );
        vi.mocked(queries.isInProgressWorkout).mockReturnValue(true);
        vi.mocked(queries.getPreviousSet).mockReturnValue(null);
        vi.mocked(queries.getNextSet).mockImplementation(
            (workoutSession) =>
                workoutSession.sessionExercises[0].sessionSets[1],
        );
        vi.mocked(queries.getCurrentSetForInProgressWorkout).mockImplementation(
            (workoutSession) =>
                workoutSession.sessionExercises[0].sessionSets[0],
        );
        vi.mocked(queries.getPreviousExerciseLastSet).mockReturnValue(null);
        vi.mocked(queries.getNextExerciseFirstSet).mockReturnValue(null);
        vi.mocked(queries.isFirstSetOfWorkout).mockReturnValue(true);
        vi.mocked(queries.isLastSetOfWorkout).mockReturnValue(false);
        vi.mocked(queries.isLastSetOfExercise).mockReturnValue(false);
        vi.mocked(queries.getWeightForCurrentSet).mockReturnValue(null);
        vi.mocked(queries.getRepsForCurrentSet).mockReturnValue(null);
        vi.mocked(queries.getRestPeriodForCurrentSet).mockReturnValue(60);
        vi.mocked(queries.getWarmUpForCurrentExercise).mockReturnValue(60);
        vi.mocked(queries.isDuringWarmUp).mockReturnValue(false);
        vi.mocked(queries.isDuringRestPeriod).mockReturnValue(false);
        vi.mocked(queries.isWarmUpStarted).mockReturnValue(true);
        vi.mocked(queries.isWarmUpEnded).mockReturnValue(true);
        vi.mocked(queries.isRestPeriodStarted).mockReturnValue(false);
        vi.mocked(queries.isRestPeriodFinished).mockReturnValue(true);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const createWrapper = () =>
        shallowMount(SetOverview, {
            ...mountOptions,
            props: {
                workoutSessionUuid: 'session-uuid',
                sessionSetUuid: 'test-set-uuid',
            },
            global: {
                ...mountOptions.global,
                stubs: {
                    ...mountOptions.global.stubs,
                    AppBar: {
                        template: '<div><slot name="right" /></div>',
                    },
                    NarrowContentContainer: {
                        template: '<div><slot /></div>',
                    },
                    ServerSyncInfo: true,
                    RestPeriodTimer: true,
                    SessionExerciseStatsModal: true,
                    LabeledWorkoutDuration: true,
                    EditExerciseModal: true,
                    TimerInput: true,
                    RouterLink: {
                        props: ['to'],
                        template: '<a><slot /></a>',
                    },
                },
            },
        });

    describe('startNextSet method', () => {
        it('optimistically advances to the next set and navigates immediately', async () => {
            const wrapper = createWrapper();

            await wrapper.vm.startNextSet();

            expect(advanceToNextSet).toHaveBeenCalledWith(
                'session-uuid',
                'test-set-uuid',
                'next-set-uuid',
            );
            expect(mockRouterPush).toHaveBeenCalledWith({
                name: 'SetOverviewPage',
                params: {
                    workoutSessionUuid: 'session-uuid',
                    sessionSetUuid: 'next-set-uuid',
                },
            });
            expect(advanceToNextSet.mock.invocationCallOrder[0]).toBeLessThan(
                mockRouterPush.mock.invocationCallOrder[0],
            );
        });

        it('toggles isSetChangeTransitioning for the duration of the route transition', async () => {
            let resolvePush;
            mockRouterPush.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolvePush = resolve;
                    }),
            );

            const wrapper = createWrapper();

            expect(wrapper.vm.isSetChangeTransitioning).toBe(false);

            const pending = wrapper.vm.startNextSet();
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isSetChangeTransitioning).toBe(true);

            resolvePush();
            await pending;

            expect(wrapper.vm.isSetChangeTransitioning).toBe(false);
        });
    });

    describe('skipExercise method', () => {
        it('optimistically skips the exercise and navigates immediately to the next exercise', async () => {
            const queries = await import(
                '../../../../components/domain/workoutSessions/composibles/workoutSessionQueries'
            );
            vi.mocked(queries.getNextExerciseFirstSet).mockReturnValue({
                uuid: 'next-exercise-set-uuid',
            });

            const wrapper = createWrapper();

            await wrapper.vm.skipExercise();

            expect(skipExerciseAndStartSet).toHaveBeenCalledWith(
                'session-uuid',
                'exercise-uuid',
                'next-exercise-set-uuid',
            );
            expect(mockRouterPush).toHaveBeenCalledWith({
                name: 'SetOverviewPage',
                params: {
                    workoutSessionUuid: 'session-uuid',
                    sessionSetUuid: 'next-exercise-set-uuid',
                },
            });
            expect(
                skipExerciseAndStartSet.mock.invocationCallOrder[0],
            ).toBeLessThan(mockRouterPush.mock.invocationCallOrder[0]);
        });

        it('skips optimistically and then ends the workout when there is no next exercise', async () => {
            const wrapper = createWrapper();

            await wrapper.vm.skipExercise();

            expect(skipExerciseAndEndWorkout).toHaveBeenCalledWith(
                'session-uuid',
                'exercise-uuid',
            );
            expect(mockRouterPush).toHaveBeenCalledWith({
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: 'session-uuid' },
            });
        });
    });

    describe('navigation state logic', () => {
        it('should set cursor-pointer class when previousExerciseLastSet exists', () => {
            const prevSet = { uuid: 'prev-set-uuid' };

            const hasValidPrevSet = Boolean(prevSet?.uuid);
            const prevClasses = {
                'text-disabled': !hasValidPrevSet,
                'cursor-pointer': hasValidPrevSet,
            };

            expect(prevClasses['cursor-pointer']).toBe(true);
            expect(prevClasses['text-disabled']).toBe(false);
        });

        it('should set text-disabled class when no previousExerciseLastSet', () => {
            const prevSet = null;

            const hasValidPrevSet = Boolean(prevSet?.uuid);
            const prevClasses = {
                'text-disabled': !hasValidPrevSet,
                'cursor-pointer': hasValidPrevSet,
            };

            expect(prevClasses['cursor-pointer']).toBe(false);
            expect(prevClasses['text-disabled']).toBe(true);
        });

        it('should set cursor-pointer class when nextExerciseFirstSet exists', () => {
            const nextSet = { uuid: 'next-set-uuid' };

            const hasValidNextSet = Boolean(nextSet?.uuid);
            const nextClasses = {
                'text-disabled': !hasValidNextSet,
                'cursor-pointer': hasValidNextSet,
            };

            expect(nextClasses['cursor-pointer']).toBe(true);
            expect(nextClasses['text-disabled']).toBe(false);
        });

        it('should set text-disabled class when no nextExerciseFirstSet', () => {
            const nextSet = null;

            const hasValidNextSet = Boolean(nextSet?.uuid);
            const nextClasses = {
                'text-disabled': !hasValidNextSet,
                'cursor-pointer': hasValidNextSet,
            };

            expect(nextClasses['cursor-pointer']).toBe(false);
            expect(nextClasses['text-disabled']).toBe(true);
        });
    });

});
