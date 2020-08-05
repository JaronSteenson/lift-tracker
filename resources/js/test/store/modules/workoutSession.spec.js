
const workoutSession = require('../../../store/modules/workoutSession');

const getters = workoutSession.getters;

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

});
