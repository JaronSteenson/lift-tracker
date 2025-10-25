import { setActivePinia, createPinia } from 'pinia';
import { useWorkoutSessionStore } from '../../stores/workoutSession';
import UuidHelper from '../../UuidHelper';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock UuidHelper
vi.mock('../../UuidHelper', () => ({
    default: {
        findDeep: vi.fn(),
    },
}));

describe('workoutSession store - nextSet getter and workoutSessionIsLoadedForSet', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('nextSet getter', () => {
        test('should return the next set with proper exercise and set sorting', () => {
            const store = useWorkoutSessionStore();

            store.workoutSession = {
                sessionExercises: [
                    {
                        uuid: 'exercise-2',
                        position: 1,
                        sessionSets: [
                            { uuid: 'set-2-2', position: 1 },
                            { uuid: 'set-2-1', position: 0 },
                        ],
                    },
                    {
                        uuid: 'exercise-1',
                        position: 0,
                        sessionSets: [
                            { uuid: 'set-1-2', position: 1 },
                            { uuid: 'set-1-1', position: 0 },
                            { uuid: 'set-1-3', position: 2 },
                        ],
                    },
                ],
            };

            const nextSet = store.nextSet('set-1-1');
            expect(nextSet).toEqual({ uuid: 'set-1-2', position: 1 });
        });

        test('should return the first set of the next exercise when current set is last in exercise', () => {
            const store = useWorkoutSessionStore();

            store.workoutSession = {
                sessionExercises: [
                    {
                        uuid: 'exercise-1',
                        position: 0,
                        sessionSets: [
                            { uuid: 'set-1-1', position: 0 },
                            { uuid: 'set-1-2', position: 1 },
                        ],
                    },
                    {
                        uuid: 'exercise-2',
                        position: 1,
                        sessionSets: [
                            { uuid: 'set-2-1', position: 0 },
                            { uuid: 'set-2-2', position: 1 },
                        ],
                    },
                ],
            };

            const nextSet = store.nextSet('set-1-2');
            expect(nextSet).toEqual({ uuid: 'set-2-1', position: 0 });
        });

        test('should return null when current set is the last set of the last exercise', () => {
            const store = useWorkoutSessionStore();

            store.workoutSession = {
                sessionExercises: [
                    {
                        uuid: 'exercise-1',
                        position: 0,
                        sessionSets: [
                            { uuid: 'set-1-1', position: 0 },
                            { uuid: 'set-1-2', position: 1 },
                        ],
                    },
                ],
            };

            const nextSet = store.nextSet('set-1-2');
            expect(nextSet).toBeNull();
        });

        test('should return null when workout session is null', () => {
            const store = useWorkoutSessionStore();
            store.workoutSession = null;

            const nextSet = store.nextSet('any-set-uuid');
            expect(nextSet).toBeNull();
        });
    });

    describe('workoutSessionIsLoadedForSet', () => {
        beforeEach(() => {
            UuidHelper.findDeep = vi.fn();
        });

        test('should return true when workout session is loaded and contains the set', () => {
            const store = useWorkoutSessionStore();
            store.workoutSession = { uuid: 'session-uuid' };

            UuidHelper.findDeep.mockReturnValue({ uuid: 'set-uuid' });

            const result = store.workoutSessionIsLoadedForSet('set-uuid');

            expect(result).toBe(true);
            expect(UuidHelper.findDeep).toHaveBeenCalledWith(
                store.workoutSession,
                'set-uuid',
            );
        });

        test('should return false when workout session is loaded but does not contain the set', () => {
            const store = useWorkoutSessionStore();
            store.workoutSession = { uuid: 'session-uuid' };

            UuidHelper.findDeep.mockReturnValue(null);

            const result = store.workoutSessionIsLoadedForSet('set-uuid');

            expect(result).toBe(false);
            expect(UuidHelper.findDeep).toHaveBeenCalledWith(
                store.workoutSession,
                'set-uuid',
            );
        });

        test('should return false when workout session is not loaded', () => {
            const store = useWorkoutSessionStore();
            store.workoutSession = null;

            const result = store.workoutSessionIsLoadedForSet('set-uuid');

            expect(result).toBeFalsy();
            expect(UuidHelper.findDeep).not.toHaveBeenCalled();
        });
    });
});
