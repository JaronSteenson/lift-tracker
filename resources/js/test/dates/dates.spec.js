import {dateDescription, hoursMinutesFromStartEnd, timeDescription, updatedAtMicro, utcNow} from '../../dates';
import { subHours, subMinutes } from 'date-fns';
import each from 'jest-each';

describe('dates', () => {

    const oneHour35MinsAgo = subMinutes(subHours(new Date(utcNow()), 1), 35);
    const thirty5MinsAgo = subMinutes(new Date(utcNow()), 35);

    describe('Hours minutes from start end', () => {

        each([
            ['2019-01-01 12:00:00', '2019-01-01 12:00:00', '0m'],
            ['2019-01-01 12:00:00', '2019-01-01 12:35:00', '35m'],
            ['2019-01-01 12:00:00', '2019-01-01 13:00:00', '1h 0m'],
            ['2019-01-01 12:00:00', '2019-01-01 13:35:00', '1h 35m'],
            [oneHour35MinsAgo, null, '1h 35m'],
            [thirty5MinsAgo, null, '35m'],
        ]).test('It should return the correct duration between "%s" and "%s"', (start, end, expected) => {
            expect(hoursMinutesFromStartEnd(start, end)).toBe(expected);
        });

    });

    describe('Time description', () => {

        each([
            ['2019-01-01 12:00:00', true, '12:00 PM'],
            [null, true, 'unfinished'],
            ['2019-01-01 12:00:00', false, '12:00 PM'],
            [null, false, 'unfinished'],
            [thirty5MinsAgo, false, '35 minutes ago'],
        ]).test('It should return the time description for "%s", noRecent flag: "%s"', (time, noRecent, expected) => {
            expect(timeDescription(time, noRecent)).toBe(expected);
        });

    });

    describe('Date description', () => {

        test('It should return "Today" for today with the recent flag off', () => {
            expect(dateDescription('2021-02-19 12:00:00', true, '2021-02-19 12:00:00')).toBe('Today');
        });

        test('It should return "Today" for today with the recent flag off when over an hour ago', () => {
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 13:00:00')).toBe('Today');
        });

        test('It should return "A moment ago" when under ten seconds ago with the recent flag on', () => {
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:00:00')).toBe('A moment ago');
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:00:01')).toBe('A moment ago');
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:00:10')).toBe('A moment ago');
        });

        test('It should return a exact seconds when over ten seconds ago with the recent flag on', () => {
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:00:11')).toBe('11 seconds ago');
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:00:59')).toBe('59 seconds ago');
        });

        test('It should "One minute ago" when over 60 seconds ago with the recent flag on', () => {
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:01:00')).toBe('1 minute ago');
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:01:59')).toBe('1 minute ago');
        });

        test('It should return minutes (no seconds) when over two minutes ago with the recent flag on', () => {
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:02:00')).toBe('2 minutes ago');
            expect(dateDescription('2021-02-19 12:00:00', false, '2021-02-19 12:02:59')).toBe('2 minutes ago');
        });

        test('It should return "Yesterday" for yesterday', () => {
            expect(dateDescription('2021-02-20 12:00:00', true, '2021-02-21 13:00:00')).toBe('Yesterday');
            expect(dateDescription('2021-02-20 12:00:00', false, '2021-02-21 13:00:00')).toBe('Yesterday');
        });

        test('It should return the week day description for days this week', () => {
            // Looking back.
            expect(dateDescription('2021-02-15 12:00:00', false, '2021-02-18 12:00:00')).toBe('15 Feb (this Monday)');
            expect(dateDescription('2021-02-16 12:00:00', false, '2021-02-18 12:00:00')).toBe('16 Feb (this Tuesday)');

            // Looking forward, not fully supported, won't work with noRecent=false.
            expect(dateDescription('2021-02-18 12:00:00', true, '2021-02-16 12:00:00')).toBe('18 Feb (this Thursday)');
        });

        test('It should return the week day description for days last week', () => {
            // Looking back.
            expect(dateDescription('2021-02-08 12:00:00', false, '2021-02-18 12:00:00')).toBe('8 Feb (last Monday)');
            expect(dateDescription('2021-02-09 12:00:00', false, '2021-02-18 12:00:00')).toBe('9 Feb (last Tuesday)');

            // Looking forward.
            expect(dateDescription('2021-02-11 12:00:00', false, '2021-02-16 12:00:00')).toBe('11 Feb (last Thursday)');
        });

        test('It should return the date without the year for dates in the current year', () => {
            expect(dateDescription('2021-01-01 12:00:00', false, '2021-02-18 12:00:00')).toBe('1 Jan');
            expect(dateDescription('2021-02-07 12:00:00', false, '2021-02-18 12:00:00')).toBe('7 Feb');
        });

        test('It should return the date with the year for dates not in the current year', () => {
            expect(dateDescription('2020-01-01 12:00:00', false, '2021-02-18 12:00:00')).toBe('1 Jan 2020');

            // Future does not work with the noRecent=true.
            expect(dateDescription('2022-01-01 12:00:00', true, '2021-02-18 12:00:00')).toBe('1 Jan 2022');
        });

    });

    describe('Updated At micro', () => {

        each([
            ['Zero seconds', '2019-01-02 12:00:00', '0s'],
            ['Some minutes', '2019-01-02 11:50:00', '10m'],
            ['Some minutes and seconds', '2019-01-02 11:49:30', '10m'],
            ['A day', '2019-01-01 12:00:00', '1d'],
            ['A few day', '2018-12-30 12:00:00', '3d'],
            ['A year', '2018-01-02 12:00:00', '365d'],
            ['Over a year', '2017-12-30 12:10:00', '367d'],
            ['null',null, '0s'],
        ]).test('It should return the correct micro time updated at description for "%s"', (testCase, time, expected) => {
            expect(updatedAtMicro(time, '2019-01-02 12:00:00')).toBe(expected);
        });

    });

});
