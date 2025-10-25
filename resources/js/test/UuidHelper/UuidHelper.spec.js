import UuidHelper from '../../UuidHelper';
import { expect, test, describe } from 'vitest';

describe('dates', () => {
    describe('Hours minutes from start end', () => {
        const expectedToFindSubject = {
            uuid: '1234-1234',
            found: true,
        };

        test.each([
            [
                'Directly on the second level object',
                { level2: expectedToFindSubject },
                expectedToFindSubject.uuid,
                expectedToFindSubject,
            ],
            [
                'A first level array',
                [{}, expectedToFindSubject, {}],
                expectedToFindSubject.uuid,
                expectedToFindSubject,
            ],
            [
                'An object with array multi-level',
                [
                    { uuid: '1a', level1: [{}, { uuid: '1b' }] },
                    { uuid: '2a', level1: [] },
                    {
                        uuid: '3a',
                        level: [
                            {
                                uuid: '3b',
                                level2: [{}, {}, expectedToFindSubject],
                            },
                        ],
                    },
                ],
                expectedToFindSubject.uuid,
                expectedToFindSubject,
            ],
        ])(
            'It should find the object in - "%s"',
            (explanation, subject, uuid, expected) => {
                expect(UuidHelper.findDeep(subject, uuid)).toBe(expected);
            },
        );
    });
});
