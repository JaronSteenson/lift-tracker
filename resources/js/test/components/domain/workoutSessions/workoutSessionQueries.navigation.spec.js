import { computed, defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import UuidHelper from '../../../../UuidHelper';
import SessionExerciseService from '../../../../api/SessionExerciseService';
import { prepareForLocalVueMount } from '../../../vueHelpers';
import {
    getNextSet,
    setIsInFocusedSession,
    useExerciseHistory,
} from '../../../../components/domain/workoutSessions/composibles/workoutSessionQueries';

vi.mock('../../../../UuidHelper', () => ({
    default: {
        findDeep: vi.fn(),
    },
}));

vi.mock('../../../../api/SessionExerciseService', () => ({
    default: {
        getHistory: vi.fn(),
    },
}));

describe('workoutSessionQueries navigation helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getNextSet', () => {
        test('returns the next set with proper exercise and set sorting', () => {
            const workoutSession = {
                sessionExercises: [
                    {
                        uuid: 'exercise-2',
                        position: 1,
                        sessionSets: [
                            { uuid: 'set-2-2', position: 1 },
                            { uuid: 'set-2-1', position: 0 },
                        ],
                    },
                    {
                        uuid: 'exercise-1',
                        position: 0,
                        sessionSets: [
                            { uuid: 'set-1-2', position: 1 },
                            { uuid: 'set-1-1', position: 0 },
                            { uuid: 'set-1-3', position: 2 },
                        ],
                    },
                ],
            };

            expect(getNextSet(workoutSession, 'set-1-1')).toEqual({
                uuid: 'set-1-2',
                position: 1,
            });
        });

        test('returns the first set of the next exercise when current set is last in exercise', () => {
            const workoutSession = {
                sessionExercises: [
                    {
                        uuid: 'exercise-1',
                        position: 0,
                        sessionSets: [
                            { uuid: 'set-1-1', position: 0 },
                            { uuid: 'set-1-2', position: 1 },
                        ],
                    },
                    {
                        uuid: 'exercise-2',
                        position: 1,
                        sessionSets: [
                            { uuid: 'set-2-1', position: 0 },
                            { uuid: 'set-2-2', position: 1 },
                        ],
                    },
                ],
            };

            expect(getNextSet(workoutSession, 'set-1-2')).toEqual({
                uuid: 'set-2-1',
                position: 0,
            });
        });

        test('returns null when current set is the last set of the last exercise', () => {
            const workoutSession = {
                sessionExercises: [
                    {
                        uuid: 'exercise-1',
                        position: 0,
                        sessionSets: [
                            { uuid: 'set-1-1', position: 0 },
                            { uuid: 'set-1-2', position: 1 },
                        ],
                    },
                ],
            };

            expect(getNextSet(workoutSession, 'set-1-2')).toBeNull();
        });

        test('returns null when workout session is null', () => {
            expect(getNextSet(null, 'any-set-uuid')).toBeNull();
        });
    });

    describe('setIsInFocusedSession', () => {
        test('returns true when workout session contains the set', () => {
            const workoutSession = { uuid: 'session-uuid' };
            UuidHelper.findDeep.mockReturnValue({ uuid: 'set-uuid' });

            expect(setIsInFocusedSession(workoutSession, 'set-uuid')).toEqual({
                uuid: 'set-uuid',
            });
            expect(UuidHelper.findDeep).toHaveBeenCalledWith(
                workoutSession,
                'set-uuid',
            );
        });

        test('returns null when workout session does not contain the set', () => {
            const workoutSession = { uuid: 'session-uuid' };
            UuidHelper.findDeep.mockReturnValue(null);

            expect(
                setIsInFocusedSession(workoutSession, 'set-uuid'),
            ).toBeNull();
        });

        test('returns null when workout session is not loaded', () => {
            UuidHelper.findDeep.mockReturnValue(null);

            expect(setIsInFocusedSession(null, 'set-uuid')).toBeNull();
            expect(UuidHelper.findDeep).toHaveBeenCalledWith(null, 'set-uuid');
        });
    });

    describe('useExerciseHistory', () => {
        test('flattens paginated history oldest-to-newest across loaded pages', async () => {
            vi.mocked(SessionExerciseService.getHistory).mockImplementation(
                async (_uuid, { pageIndex }) => ({
                    data:
                        pageIndex === 1
                            ? {
                                  items: [
                                      { uuid: 'exercise-8' },
                                      { uuid: 'exercise-9' },
                                      { uuid: 'exercise-10' },
                                  ],
                                  pageIndex: 1,
                                  pageSize: 3,
                                  totalCount: 6,
                                  totalPages: 2,
                                  hasNextPage: true,
                                  hasPreviousPage: false,
                              }
                            : {
                                  items: [
                                      { uuid: 'exercise-5' },
                                      { uuid: 'exercise-6' },
                                      { uuid: 'exercise-7' },
                                  ],
                                  pageIndex: 2,
                                  pageSize: 3,
                                  totalCount: 6,
                                  totalPages: 2,
                                  hasNextPage: false,
                                  hasPreviousPage: true,
                              },
                }),
            );

            const Harness = defineComponent({
                setup() {
                    return useExerciseHistory(
                        computed(() => 'exercise-source'),
                    );
                },
                render() {
                    return h('div');
                },
            });

            const wrapper = mount(Harness, prepareForLocalVueMount());
            await flushPromises();
            await wrapper.vm.fetchNextPage();
            await flushPromises();

            expect(wrapper.vm.exerciseHistory.map((item) => item.uuid)).toEqual(
                [
                    'exercise-5',
                    'exercise-6',
                    'exercise-7',
                    'exercise-8',
                    'exercise-9',
                    'exercise-10',
                ],
            );
        });
    });
});
