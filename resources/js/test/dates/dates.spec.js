import {hoursMinutesFromStartEnd, utcNow} from '../../dates';
import { subHours, subMinutes } from 'date-fns';
import each from 'jest-each';

describe('dates', () => {

    describe('hours minutes from start end', () => {

        each([
            ['2019-01-01 12:00:00', '2019-01-01 12:00:00', '0m'],
            ['2019-01-01 12:00:00', '2019-01-01 12:35:00', '35m'],
            ['2019-01-01 12:00:00', '2019-01-01 13:00:00', '1h 0m'],
            ['2019-01-01 12:00:00', '2019-01-01 13:35:00', '1h 35m'],
            [subMinutes(subHours(new Date(utcNow()), 1), 35), null, '1h 35m (unfinished)'],
        ]).test('returns the result of duration between %s and %s', (a, b, expected) => {
            expect(hoursMinutesFromStartEnd(a, b)).toBe(expected);
        });

    });

});
