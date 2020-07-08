import {hoursMinutesFromStartEnd, timeDescription, updatedAtMicro, utcNow} from '../../dates';
import { subHours, subMinutes } from 'date-fns';
import each from 'jest-each';

describe('dates', () => {

    const oneHour35MinsAgo = subMinutes(subHours(new Date(utcNow()), 1), 35);
    const thirty5MinsAgo = subMinutes(new Date(utcNow()), 35);

    describe('hours minutes from start end', () => {

        each([
            ['2019-01-01 12:00:00', '2019-01-01 12:00:00', '0m'],
            ['2019-01-01 12:00:00', '2019-01-01 12:35:00', '35m'],
            ['2019-01-01 12:00:00', '2019-01-01 13:00:00', '1h 0m'],
            ['2019-01-01 12:00:00', '2019-01-01 13:35:00', '1h 35m'],
            [oneHour35MinsAgo, null, '1h 35m'],
            [thirty5MinsAgo, null, '35m'],
        ]).test('returns the result of duration between %s and %s', (start, end, expected) => {
            expect(hoursMinutesFromStartEnd(start, end)).toBe(expected);
        });

    });

    describe('time description', () => {

        each([
            ['2019-01-01 12:00:00', true, '12:00 PM'],
            [null, true, 'unfinished'],

            ['2019-01-01 12:00:00', false, '12:00 PM'],
            [null, false, 'unfinished'],
            [thirty5MinsAgo, false, '35 minutes ago'],
        ]).test('returns the time description for %s, noRecent flag: %s', (time, noRecent, expected) => {
            expect(timeDescription(time, noRecent)).toBe(expected);
        });

    });

    describe('updated At micro', () => {
        each([
            ['Zero seconds', '2019-01-02 12:00:00', '0s'],
            ['Some minutes', '2019-01-02 11:50:00', '10m 0s'],
            ['Some minutes and seconds', '2019-01-02 11:49:30', '10m 30s'],
            ['A day', '2019-01-01 12:00:00', '1d'],
            ['A year', '2018-01-01 12:10:00', '365d'],
            ['null',null, '0s'],
        ]).test('returns the micro time updated at description for %s', (testCase, time, expected) => {
            expect(updatedAtMicro(time, '2019-01-02 12:00:00')).toBe(expected);
        });

    });

});
