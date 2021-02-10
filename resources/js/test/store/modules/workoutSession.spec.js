

import { getters, actions } from '../../../store/modules/workoutSession';
import { describe } from "@jest/globals";
import each from 'jest-each';

describe('workout session store', () => {

    describe('getters', () => {

        describe('isLastSetOfExercise', () => {

            each([
                [true, 'the supplied uuid belongs to the only set in the exercise', [{uuid: 1}], 1],
                [false, 'the supplied uuid is not in the exercise', [{uuid: 1}], 2],
                [true, 'the supplied uuid is the last set in the exercise', [{uuid: 1}, {uuid: 2}, {uuid: 3},], 3],
                [false, 'the supplied uuid is not the last set in the exercise', [{uuid: 1}, {uuid: 2}, {uuid: 3},], 2],
            ]).test('returns %s when %s', (expected, description, sessionSets, askingForSetUuid) => {
                getters.exerciseBySet = () => {
                    return { sessionSets };
                };

                expect(getters.isLastSetOfExercise(null, getters)(askingForSetUuid)).toBe(expected);
            });

        });

    });

    describe('actions', () => {

        describe('updateSetWeight in progress session', () => {
            const commit = jest.fn();
            const dispatch = jest.fn();

            const getters = {
                isInProgressWorkout: true,
                exerciseBySet() {
                    return {
                        name: 'Test exercise',
                        uuid: 'exercise-uuid',
                        sessionSets: [
                            { uuid: 'first-set', weight: 50, startedAt: '2020-12-12T19:00:00', },
                            { uuid: 'middle-set', weight: 50, startedAt: '2020-12-12T19:00:05', },
                            { uuid: 'final-set', weight: 50, startedAt: null, },
                        ],
                    };
                },
            }

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

        describe('updateSetWeight historic session', () => {
            const commit = jest.fn();
            const dispatch = jest.fn();

            const getters = {
                isInProgressWorkout: false,
                exerciseBySet() {
                    return {
                        name: 'Test exercise',
                        uuid: 'exercise-uuid',
                        sessionSets: [
                            { uuid: 'first-set', weight: 50, startedAt: '2020-12-12T19:00:00', },
                            { uuid: 'middle-set', weight: 50, startedAt: '2020-12-12T19:00:05', },
                            { uuid: 'final-set', weight: 50, startedAt: null, },
                        ],
                    };
                },
            }

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
