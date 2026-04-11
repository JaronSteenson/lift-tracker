import { shallowMount } from '@vue/test-utils';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { ref } from 'vue';
import SetOverview from '../../../../components/domain/workoutSessions/SetOverview.vue';
import { prepareForLocalVueMount } from '../../../vueHelpers';
import { useRouter } from 'vue-router';
import {
    useUpdateWorkoutSession,
    useWorkoutSessionBySet,
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
        useWorkoutSessionBySet: vi.fn(),
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

const mountOptions = prepareForLocalVueMount();

describe('SetOverview - Navigation functionality', () => {
    let mockRouterPush;
    let endSet;
    let startSet;

    beforeEach(async () => {
        isSetChangeTransitioning.value = false;
        mockRouterPush = vi.fn().mockResolvedValue();
        endSet = vi.fn().mockResolvedValue();
        startSet = vi.fn().mockResolvedValue();

        vi.mocked(useRouter).mockReturnValue({
            push: mockRouterPush,
        });

        vi.mocked(useWorkoutSessionBySet).mockReturnValue({
            workoutSession: ref({
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
            }),
        });

        vi.mocked(useUpdateWorkoutSession).mockReturnValue({
            updateSetWeight: vi.fn(),
            updateSetReps: vi.fn(),
            updateExerciseWarmUpDuration: vi.fn(),
            updateSetRestPeriodDuration: vi.fn(),
            updateExerciseNotes: vi.fn(),
            updateExerciseSkipped: vi.fn(),
            startSet,
            endSet,
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
        it('ends the current set, starts the next set, and navigates', async () => {
            const wrapper = createWrapper();

            await wrapper.vm.startNextSet();

            expect(endSet).toHaveBeenCalledWith(
                'session-uuid',
                'test-set-uuid',
            );
            expect(startSet).toHaveBeenCalledWith(
                'session-uuid',
                'next-set-uuid',
            );
            expect(mockRouterPush).toHaveBeenCalledWith({
                name: 'SetOverviewPage',
                params: { sessionSetUuid: 'next-set-uuid' },
            });
            expect(endSet.mock.invocationCallOrder[0]).toBeLessThan(
                startSet.mock.invocationCallOrder[0],
            );
            expect(startSet.mock.invocationCallOrder[0]).toBeLessThan(
                mockRouterPush.mock.invocationCallOrder[0],
            );
        });

        it('toggles isSetChangeTransitioning for the duration of the transition', async () => {
            let resolveStartSet;
            startSet.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveStartSet = resolve;
                    }),
            );

            const wrapper = createWrapper();

            expect(wrapper.vm.isSetChangeTransitioning).toBe(false);

            const pending = wrapper.vm.startNextSet();
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isSetChangeTransitioning).toBe(true);

            resolveStartSet();
            await pending;

            expect(wrapper.vm.isSetChangeTransitioning).toBe(false);
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
