import { describe, expect, it } from 'vitest';
import { serializeWorkoutSessionForSave } from '../../stores/workoutSession';

describe('serializeWorkoutSessionForSave', () => {
    it('serializes relationship references as UUID fields', () => {
        const payload = serializeWorkoutSessionForSave({
            uuid: 'session-1',
            createdAt: '2026-04-06T10:00:00Z',
            updatedAt: '2026-04-06T10:00:01Z',
            name: 'Push Day',
            startedAt: '2026-04-06T10:00:00Z',
            endedAt: null,
            notes: 'note',
            bodyWeight: 90,
            workoutProgramRoutineUuid: 'routine-1',
            workoutProgramRoutineName: 'Should not be sent',
            workoutProgramUuid: 'program-1',
            workoutProgramName: 'Should not be sent either',
            sessionExercises: [
                {
                    uuid: 'exercise-1',
                    createdAt: '2026-04-06T10:00:02Z',
                    updatedAt: '2026-04-06T10:00:03Z',
                    name: 'Bench Press',
                    plannedWeight: 100,
                    plannedRestPeriodDuration: 120,
                    notes: 'steady',
                    position: 0,
                    skipped: false,
                    plannedWarmUp: 60,
                    warmUpStartedAt: null,
                    warmUpEndedAt: null,
                    warmUpDuration: null,
                    routineExercise: {
                        uuid: 'routine-exercise-1',
                        name: 'Should not be sent',
                    },
                    sessionSets: [
                        {
                            uuid: 'set-1',
                            createdAt: '2026-04-06T10:00:04Z',
                            updatedAt: '2026-04-06T10:00:05Z',
                            reps: 5,
                            weight: 100,
                            restPeriodDuration: 120,
                            restPeriodStartedAt: null,
                            restPeriodEndedAt: null,
                            position: 0,
                            startedAt: '2026-04-06T10:00:06Z',
                            endedAt: null,
                            warmUpStartedAt: null,
                            warmUpEndedAt: null,
                            warmUpDuration: null,
                        },
                    ],
                },
            ],
        });

        expect(payload).toEqual({
            uuid: 'session-1',
            createdAt: '2026-04-06T10:00:00Z',
            updatedAt: '2026-04-06T10:00:01Z',
            name: 'Push Day',
            startedAt: '2026-04-06T10:00:00Z',
            endedAt: null,
            notes: 'note',
            bodyWeight: 90,
            workoutProgramRoutineUuid: 'routine-1',
            sessionExercises: [
                {
                    uuid: 'exercise-1',
                    createdAt: '2026-04-06T10:00:02Z',
                    updatedAt: '2026-04-06T10:00:03Z',
                    name: 'Bench Press',
                    plannedWeight: 100,
                    plannedRestPeriodDuration: 120,
                    notes: 'steady',
                    position: 0,
                    skipped: false,
                    plannedWarmUp: 60,
                    warmUpStartedAt: null,
                    warmUpEndedAt: null,
                    warmUpDuration: null,
                    routineExerciseUuid: 'routine-exercise-1',
                    sessionSets: [
                        {
                            uuid: 'set-1',
                            createdAt: '2026-04-06T10:00:04Z',
                            updatedAt: '2026-04-06T10:00:05Z',
                            reps: 5,
                            weight: 100,
                            restPeriodDuration: 120,
                            restPeriodStartedAt: null,
                            restPeriodEndedAt: null,
                            position: 0,
                            startedAt: '2026-04-06T10:00:06Z',
                            endedAt: null,
                            warmUpStartedAt: null,
                            warmUpEndedAt: null,
                            warmUpDuration: null,
                        },
                    ],
                },
            ],
        });
    });
});
