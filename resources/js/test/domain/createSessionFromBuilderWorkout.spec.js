import { expect, test, describe, beforeEach, vi } from 'vitest';
import createSessionFromBuilderWorkout, {
    createCheckIn,
} from '../../domain/createSessionFromBuilderWorkout';
import UuidHelper from '../../UuidHelper';

describe('createSessionFromBuilderWorkout', () => {
    const mockNow = '2023-01-01T12:00:00Z';
    const mockUuid = 'mock-uuid-123';

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(mockNow);
        vi.spyOn(UuidHelper, 'assign').mockReturnValue(mockUuid);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('createCheckIn', () => {
        test('should create a basic check-in object', () => {
            const checkIn = createCheckIn();

            expect(checkIn).toEqual({
                uuid: mockUuid,
                name: 'Check-in',
                notes: null,
                bodyWeight: null,
                startedAt: null,
                endedAt: null,
                createdAt: null,
                workoutProgramRoutine: null,
                sessionExercises: [],
            });
        });

        test('should assign a UUID', () => {
            createCheckIn();
            expect(UuidHelper.assign).toHaveBeenCalledTimes(1);
        });
    });

    describe('createSessionFromBuilderWorkout wtesth existingCheckIn', () => {
        const existingCheckIn = {
            uuid: 'existing-uuid',
            name: 'Check-in',
            notes: null,
            bodyWeight: 75.5,
            startedAt: null,
            endedAt: null,
            createdAt: '2022-12-31T10:00:00Z',
            workoutProgramRoutine: null,
            sessionExercises: [],
        };

        const originWorkout = {
            name: 'Push Day',
            routineExercises: [
                {
                    uuid: 'exercise-1-uuid',
                    name: 'Bench Press',
                    notes: 'Focus on form',
                    weight: 100,
                    numberOfSets: 3,
                    restPeriod: 120,
                    warmUp: 30,
                    position: 0,
                },
                {
                    uuid: 'exercise-2-uuid',
                    name: 'Push-ups',
                    weight: null,
                    numberOfSets: 2,
                    restPeriod: null,
                    warmUp: null,
                    position: 1,
                },
            ],
        };

        test('should merge existing check-in with workout data', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            expect(session).toEqual(
                expect.objectContaining({
                    uuid: 'existing-uuid',
                    name: 'Push Day',
                    notes: null,
                    bodyWeight: 75.5,
                    startedAt: mockNow,
                    endedAt: null,
                    createdAt: '2022-12-31T10:00:00Z',
                    workoutProgramRoutine: originWorkout,
                }),
            );
        });

        test('should create session exercises from routine exercises', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            expect(session.sessionExercises).toHaveLength(2);
            expect(session.sessionExercises[0]).toEqual(
                expect.objectContaining({
                    uuid: mockUuid,
                    name: 'Bench Press',
                    notes: 'Focus on form',
                    plannedWeight: 100,
                    warmUpDuration: 30,
                    position: 0,
                    skipped: false,
                    routineExercise: {
                        uuid: 'exercise-1-uuid',
                    },
                    sessionSets: [
                        {
                            createdAt: mockNow,
                            position: 0,
                            restPeriodDuration: 120,
                            startedAt: mockNow,
                            updatedAt: mockNow,
                            uuid: mockUuid,
                            weight: 100,
                        },
                        {
                            createdAt: mockNow,
                            position: 1,
                            restPeriodDuration: 120,
                            startedAt: null,
                            updatedAt: mockNow,
                            uuid: mockUuid,
                            weight: 100,
                        },
                        {
                            createdAt: mockNow,
                            position: 2,
                            restPeriodDuration: 120,
                            startedAt: null,
                            updatedAt: mockNow,
                            uuid: mockUuid,
                            weight: 100,
                        },
                    ],
                }),
            );
        });

        test('should create session sets for each exercise', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            expect(session.sessionExercises[0].sessionSets).toHaveLength(3);
            expect(session.sessionExercises[1].sessionSets).toHaveLength(2);

            session.sessionExercises[0].sessionSets.forEach((set, index) => {
                expect(set).toEqual({
                    uuid: mockUuid,
                    weight: 100,
                    position: index,
                    restPeriodDuration: 120,
                    startedAt: index === 0 ? mockNow : null,
                    createdAt: mockNow,
                    updatedAt: mockNow,
                });
            });
        });

        test('should set startedAt on the first set of the first exercise', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            expect(session.sessionExercises[0].sessionSets[0].startedAt).toBe(
                mockNow,
            );
        });

        test('should handle exercises wtesth missing optional fields', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            const secondExercise = session.sessionExercises[1];
            expect(secondExercise).toEqual(
                expect.objectContaining({
                    name: 'Push-ups',
                    notes: null,
                    plannedWeight: null,
                    sessionSets: [
                        {
                            createdAt: mockNow,
                            position: 0,
                            restPeriodDuration: null,
                            startedAt: null,
                            updatedAt: mockNow,
                            uuid: mockUuid,
                            weight: null,
                        },
                        {
                            createdAt: mockNow,
                            position: 1,
                            restPeriodDuration: null,
                            startedAt: null,
                            updatedAt: mockNow,
                            uuid: mockUuid,
                            weight: null,
                        },
                    ],
                }),
            );
        });

        test('should handle exercise wtesth missing name', () => {
            const workoutWtesthUnnamedExercise = {
                name: 'Test Workout',
                routineExercises: [
                    {
                        uuid: 'exercise-uuid',
                        numberOfSets: 1,
                        position: 0,
                    },
                ],
            };

            const session = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout: workoutWtesthUnnamedExercise,
            });

            expect(session.sessionExercises[0].name).toBe('Unnamed exercise');
        });
    });

    describe('createSessionFromBuilderWorkout wtesthout existingCheckIn', () => {
        const originWorkout = {
            name: 'Pull Day',
            routineExercises: [
                {
                    uuid: 'pull-exercise-uuid',
                    name: 'Pull-ups',
                    weight: 25,
                    numberOfSets: 4,
                    position: 0,
                },
            ],
        };

        test('should create a new session when no existing check-in provided', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn: null,
                originWorkout,
            });

            expect(session).toEqual(
                expect.objectContaining({
                    uuid: mockUuid,
                    name: 'Pull Day',
                    notes: null,
                    bodyWeight: null,
                    startedAt: mockNow,
                    endedAt: null,
                    createdAt: null,
                    workoutProgramRoutine: originWorkout,
                }),
            );
        });

        test('should create session exercises for new session', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn: null,
                originWorkout,
            });

            expect(session.sessionExercises).toHaveLength(1);
            expect(session.sessionExercises[0]).toEqual(
                expect.objectContaining({
                    name: 'Pull-ups',
                    plannedWeight: 25,
                    position: 0,
                }),
            );
        });
    });

    describe('createSessionFromBuilderWorkout wtesth empty workout', () => {
        const emptyWorkout = {
            name: 'Empty Workout',
            routineExercises: [],
        };

        test('should create a single exercise for empty workout', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn: null,
                originWorkout: emptyWorkout,
            });

            expect(session.sessionExercises).toHaveLength(1);
            expect(session.sessionExercises[0]).toEqual({
                uuid: mockUuid,
                name: 'Empty Workout',
                position: 0,
                plannedWeight: null,
                plannedRestPeriodDuration: null,
                plannedWarmUp: null,
                sessionSets: [
                    {
                        uuid: mockUuid,
                        weight: null,
                        position: 0,
                        startedAt: mockNow,
                    },
                ],
                routineExerciseUuid: null,
            });
        });

        test('should set startedAt on the first set of empty workout exercise', () => {
            const session = createSessionFromBuilderWorkout({
                existingCheckIn: null,
                originWorkout: emptyWorkout,
            });

            expect(session.sessionExercises[0].sessionSets[0].startedAt).toBe(
                mockNow,
            );
        });
    });

    describe('UUID generation', () => {
        test('should generate unique UUIDs for each enttesty', () => {
            const uuidCalls = [];
            UuidHelper.assign.mockImplementation(() => {
                const uuid = `uuid-${uuidCalls.length}`;
                uuidCalls.push(uuid);
                return uuid;
            });

            const originWorkout = {
                name: 'Multi Exercise',
                routineExercises: [
                    {
                        uuid: 'routine-1',
                        name: 'Exercise 1',
                        numberOfSets: 2,
                        position: 0,
                    },
                    {
                        uuid: 'routine-2',
                        name: 'Exercise 2',
                        numberOfSets: 1,
                        position: 1,
                    },
                ],
            };

            createSessionFromBuilderWorkout({
                existingCheckIn: null,
                originWorkout,
            });

            // Should generate UUIDs for: session, 2 exercises, 3 sets total
            expect(UuidHelper.assign).toHaveBeenCalledTimes(6);
        });
    });

    describe('edge cases', () => {
        test('should handle workout wtesth zero sets', () => {
            const workoutWtesthZeroSets = {
                name: 'Zero Sets Workout',
                routineExercises: [
                    {
                        uuid: 'exercise-uuid',
                        name: 'Test Exercise',
                        numberOfSets: 0,
                        position: 0,
                    },
                ],
            };

            const session = createSessionFromBuilderWorkout({
                existingCheckIn: null,
                originWorkout: workoutWtesthZeroSets,
            });

            expect(session.sessionExercises[0].sessionSets).toHaveLength(1);
        });

        test('should handle undefined existingCheckIn', () => {
            const originWorkout = {
                name: 'Test Workout',
                routineExercises: [],
            };

            const session = createSessionFromBuilderWorkout({
                existingCheckIn: undefined,
                originWorkout,
            });

            expect(session.uuid).toBe(mockUuid);
            expect(session.name).toBe('Test Workout');
        });
    });
});
