import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createCheckIn } from '../../domain/createSessionFromBuilderWorkout';
import UuidHelper from '../../UuidHelper';

describe('createSessionFromBuilderWorkout', () => {
    beforeEach(() => {
        vi.spyOn(UuidHelper, 'assign').mockReturnValue('mock-uuid-123');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('createCheckIn creates a basic check-in object', () => {
        expect(createCheckIn()).toEqual({
            uuid: 'mock-uuid-123',
            name: 'Check-in',
            notes: null,
            bodyWeight: null,
            startedAt: null,
            endedAt: null,
            createdAt: null,
            workoutProgramRoutineUuid: null,
            workoutProgramRoutineName: null,
            workoutProgramUuid: null,
            workoutProgramName: null,
            sessionExercises: [],
        });
    });
});
