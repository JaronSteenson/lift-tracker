import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../stores/app', () => ({
    useAppStore: () => ({
        localOnlyUser: false,
    }),
}));

vi.mock('../../../api/WorkoutProgramService', () => ({
    default: {
        save: vi.fn(),
    },
}));

import { serializeProgramForSave } from '../../stores/programBuilder';

describe('serializeProgramForSave', () => {
    it('drops blank routine exercises and strips nested relationship noise', () => {
        const payload = serializeProgramForSave({
            uuid: 'program-1',
            name: 'Push Program',
            createdAt: '2026-04-06T10:00:00Z',
            updatedAt: '2026-04-06T10:00:01Z',
            workoutProgramRoutines: [
                {
                    uuid: 'routine-1',
                    name: 'Day 1',
                    normalDay: 'monday',
                    position: 0,
                    workoutProgram: { uuid: 'should-not-send' },
                    routineExercises: [
                        {
                            uuid: 'exercise-1',
                            name: 'Bench Press',
                            numberOfSets: 3,
                            position: 0,
                            weight: 100,
                            restPeriod: 120,
                            warmUp: 60,
                            workoutProgramRoutine: { uuid: 'should-not-send' },
                        },
                        {
                            uuid: 'exercise-2',
                            name: '',
                            numberOfSets: null,
                            position: 1,
                            weight: null,
                            restPeriod: null,
                            warmUp: null,
                        },
                    ],
                },
            ],
        });

        expect(payload).toEqual({
            uuid: 'program-1',
            name: 'Push Program',
            createdAt: '2026-04-06T10:00:00Z',
            updatedAt: '2026-04-06T10:00:01Z',
            workoutProgramRoutines: [
                {
                    uuid: 'routine-1',
                    name: 'Day 1',
                    normalDay: 'monday',
                    position: 0,
                    routineExercises: [
                        {
                            uuid: 'exercise-1',
                            name: 'Bench Press',
                            numberOfSets: 3,
                            position: 0,
                            weight: 100,
                            restPeriod: 120,
                            warmUp: 60,
                        },
                    ],
                },
            ],
        });
    });
});
