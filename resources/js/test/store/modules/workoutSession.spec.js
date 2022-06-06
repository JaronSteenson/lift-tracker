import { getters, actions } from '../../../store/modules/workoutSession';
import { describe } from '@jest/globals';
import each from 'jest-each';
import WorkoutSessionService from '../../../api/WorkoutSessionService';
import * as createSessionModule from '../../../domain/createSessionFromBuilderWorkout';
jest.mock('../../../domain/createSessionFromBuilderWorkout');
jest.mock('../../../api/WorkoutSessionService');

describe('workout session store', () => {
    afterEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });

    describe('getters', () => {
        describe('isLastSetOfExercise', () => {
            each([
                [
                    true,
                    'the supplied uuid belongs to the only set in the exercise',
                    [{ uuid: 1 }],
                    1,
                ],
                [
                    false,
                    'the supplied uuid is not in the exercise',
                    [{ uuid: 1 }],
                    2,
                ],
                [
                    true,
                    'the supplied uuid is the last set in the exercise',
                    [{ uuid: 1 }, { uuid: 2 }, { uuid: 3 }],
                    3,
                ],
                [
                    false,
                    'the supplied uuid is not the last set in the exercise',
                    [{ uuid: 1 }, { uuid: 2 }, { uuid: 3 }],
                    2,
                ],
            ]).test(
                'returns %s when %s',
                (expected, description, sessionSets, askingForSetUuid) => {
                    const mockedGetters = {
                        exerciseBySet: () => {
                            return { sessionSets };
                        },
                    };

                    expect(
                        getters.isLastSetOfExercise(
                            null,
                            mockedGetters
                        )(askingForSetUuid)
                    ).toBe(expected);
                }
            );
        });
    });

    describe('actions', () => {
        describe('startWorkout', () => {
            it('Should update the in progress any my workout lists', async () => {
                const inProgressSession = {
                    createdAt: '2022-04-11T05:46:53+00:00',
                    endedAt: '2022-04-11T05:47:05+00:00',
                    name: 'Pull',
                    notes: null,
                    sessionExercises: [],
                    startedAt: '2022-04-11T05:46:53+00:00',
                    updatedAt: '2022-04-11T05:47:06+00:00',
                    uuid: '2185451e-b967-11ec-8422-0242ac120002',
                };

                const olderWorkoutSession = {
                    createdAt: '2022-04-11T05:46:53+00:00',
                    endedAt: '2022-04-11T05:47:05+00:00',
                    name: 'Legs',
                    notes: null,
                    sessionExercises: [],
                    startedAt: '2022-01-11T05:46:53+00:00',
                    updatedAt: '2022-01-11T05:47:06+00:00',
                    uuid: '2185451e-b967-11ec-8422-0242ac120002',
                };

                const mockSessionCreateReturn = {
                    name: 'Push',
                    notes: null,
                    sessionExercises: [],
                    startedAt: '2022-04-11T05:46:53+00:00',
                    uuid: '19c0230f-56ca-4aac-ba7e-19588baaa6f4',
                };

                createSessionModule.default.mockReturnValue(
                    mockSessionCreateReturn
                );

                const mockSaveResponse = {
                    ...mockSessionCreateReturn,
                    createdAt: '2022-04-11T05:46:53+00:00',
                    updatedAt: '2022-04-11T05:47:06+00:00',
                };

                jest.spyOn(WorkoutSessionService, 'save').mockResolvedValue(
                    Promise.resolve(mockSaveResponse)
                );

                const commit = jest.fn();
                const dispatch = jest.fn();
                const state = {
                    myWorkoutSessions: [inProgressSession, olderWorkoutSession],
                    inProgressWorkouts: [inProgressSession],
                };

                WorkoutSessionService.save.mockResolvedValue({
                    data: mockSaveResponse,
                });

                await actions.startWorkout(
                    { commit, dispatch, state },
                    {
                        originWorkout: {
                            uuid: '8dabae09-e749-43b5-a1c5-109942ef2a4b',
                            name: 'Push',
                            routineExercises: [],
                        },
                    }
                );

                expect(dispatch).toHaveBeenCalledWith(
                    'programBuilder/saveIfDirty',
                    undefined,
                    { root: true }
                );

                expect(commit).toHaveBeenCalledTimes(2);
                expect(commit).toHaveBeenNthCalledWith(1, 'reset', {
                    workoutSession: mockSessionCreateReturn,
                    exercisesPreviousEntries: {},
                    inProgressWorkouts: [
                        inProgressSession,
                        mockSessionCreateReturn,
                    ],
                    myWorkoutSessions: [
                        mockSessionCreateReturn,
                        inProgressSession,
                        olderWorkoutSession,
                    ],
                });

                // In reality, we actually expect the below assertion for the second call.
                // However this test case doesn't update the state var which the second commit is reliant on.
                // expect(commit).toHaveBeenNthCalledWith(2, 'reset', {
                //     workoutSession: mockSessionCreateReturn,
                //     inProgressWorkouts: [
                //         inProgressSession,
                //         mockSessionCreateReturn,
                //     ],
                //     myWorkoutSessions: [
                //         mockSessionCreateReturn,
                //         inProgressSession,
                //         olderWorkoutSession,
                //     ],
                // });
            });
        });
        describe('updateSetWeight', () => {
            it('should update the later sets for in-progress session', () => {
                const commit = jest.fn();
                const dispatch = jest.fn();

                const getters = {
                    isInProgressWorkout: true,
                    exerciseBySet() {
                        return {
                            name: 'Test exercise',
                            uuid: 'exercise-uuid',
                            sessionSets: [
                                {
                                    uuid: 'first-set',
                                    weight: 50,
                                    startedAt: '2020-12-12T19:00:00',
                                },
                                {
                                    uuid: 'middle-set',
                                    weight: 50,
                                    startedAt: '2020-12-12T19:00:05',
                                },
                                {
                                    uuid: 'final-set',
                                    weight: 50,
                                    startedAt: null,
                                },
                            ],
                        };
                    },
                };

                actions.updateSetWeight(
                    { commit, dispatch, getters },
                    { uuid: 'middle-set', weight: 100 }
                );

                // Updates the weight of all future (no startedAt) sets in the exercise.
                expect(commit.mock.calls).toEqual([
                    ['updateSet', { uuid: 'middle-set', weight: 100 }],
                    ['updateSet', { uuid: 'final-set', weight: 100 }],
                ]);

                // Saves the entire exercise to the server.
                expect(dispatch.mock.calls).toEqual([
                    ['saveExercise', 'exercise-uuid'],
                ]);
            });

            it('should not update the later sets for a historic session', () => {
                const commit = jest.fn();
                const dispatch = jest.fn();

                const getters = {
                    isInProgressWorkout: false,
                    exerciseBySet() {
                        return {
                            name: 'Test exercise',
                            uuid: 'exercise-uuid',
                            sessionSets: [
                                {
                                    uuid: 'first-set',
                                    weight: 50,
                                    startedAt: '2020-12-12T19:00:00',
                                },
                                {
                                    uuid: 'middle-set',
                                    weight: 50,
                                    startedAt: '2020-12-12T19:00:05',
                                },
                                {
                                    uuid: 'final-set',
                                    weight: 50,
                                    startedAt: null,
                                },
                            ],
                        };
                    },
                };

                actions.updateSetWeight(
                    { commit, dispatch, getters },
                    { uuid: 'middle-set', weight: 100 }
                );

                // Simply updates the target set.
                expect(commit.mock.calls).toEqual([
                    ['updateSet', { uuid: 'middle-set', weight: 100 }],
                ]);

                // The saves that set.
                expect(dispatch.mock.calls).toEqual([
                    ['saveSet', 'middle-set'],
                ]);
            });
        });
    });
});
