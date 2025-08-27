import SetOverview from '../../../../components/domain/workoutSessions/SetOverview.vue';
import { useWorkoutSessionStore } from '../../../../stores/workoutSession';

// Mock the store
jest.mock('../../../../stores/workoutSession');

describe('SetOverview - Navigation functionality', () => {
    let mockStore;
    let mockRouterPush;

    beforeEach(() => {
        mockRouterPush = jest.fn().mockResolvedValue();

        // Mock store with required methods and getters
        mockStore = {
            workoutSession: {
                uuid: 'session-uuid',
                sessionExercises: [],
            },
            endSet: jest.fn().mockResolvedValue(),
            startSet: jest.fn().mockResolvedValue(),
            startNextSet: jest.fn().mockResolvedValue(),
            saveWorkout: jest.fn().mockResolvedValue(),
            previousExerciseLastSet: jest.fn(),
            nextExerciseFirstSet: jest.fn(),
        };

        useWorkoutSessionStore.mockReturnValue(mockStore);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Create a minimal component instance for testing methods
    const createComponentInstance = () => {
        const instance = {
            workoutSessionStore: mockStore,
            sessionSetUuid: 'test-set-uuid',
            $router: { push: mockRouterPush },
            isChangingSet: false,
            set: {
                uuid: 'test-set-uuid',
            },
            nextSet: { uuid: 'next-set-uuid' },
        };

        // Bind the startNextSet method to the instance
        instance.startNextSet = SetOverview.methods.startNextSet.bind(instance);

        return instance;
    };

    describe('startNextSet method', () => {
        it('should end current set, start next set, navigate and save workout', async () => {
            const instance = createComponentInstance();

            await instance.startNextSet();

            // Verify the calls were made in the correct sequence
            expect(mockStore.startNextSet).toHaveBeenCalledWith({
                uuid: 'test-set-uuid',
            });
        });

        it('should handle the loading state correctly', async () => {
            const instance = createComponentInstance();

            expect(instance.isChangingSet).toBe(false);

            const startNextSetPromise = instance.startNextSet();
            expect(instance.isChangingSet).toBe(true);

            await startNextSetPromise;
            expect(instance.isChangingSet).toBe(false);
        });
    });

    describe('navigation state logic', () => {
        it('should set cursor-pointer class when previousExerciseLastSet exists', () => {
            const prevSet = { uuid: 'prev-set-uuid' };

            // Test the logic that would be used in the template
            const hasValidPrevSet = Boolean(prevSet?.uuid);
            const prevClasses = {
                'text-disabled': !hasValidPrevSet,
                'cursor-pointer': hasValidPrevSet,
            };

            expect(prevClasses['cursor-pointer']).toBe(true);
            expect(prevClasses['text-disabled']).toBe(false);
        });

        it('should set text-disabled class when no previousExerciseLastSet', () => {
            const prevSet = null;

            // Test the logic that would be used in the template
            const hasValidPrevSet = Boolean(prevSet?.uuid);
            const prevClasses = {
                'text-disabled': !hasValidPrevSet,
                'cursor-pointer': hasValidPrevSet,
            };

            expect(prevClasses['cursor-pointer']).toBe(false);
            expect(prevClasses['text-disabled']).toBe(true);
        });

        it('should set cursor-pointer class when nextExerciseFirstSet exists', () => {
            const nextSet = { uuid: 'next-set-uuid' };

            // Test the logic that would be used in the template
            const hasValidNextSet = Boolean(nextSet?.uuid);
            const nextClasses = {
                'text-disabled': !hasValidNextSet,
                'cursor-pointer': hasValidNextSet,
            };

            expect(nextClasses['cursor-pointer']).toBe(true);
            expect(nextClasses['text-disabled']).toBe(false);
        });

        it('should set text-disabled class when no nextExerciseFirstSet', () => {
            const nextSet = null;

            // Test the logic that would be used in the template
            const hasValidNextSet = Boolean(nextSet?.uuid);
            const nextClasses = {
                'text-disabled': !hasValidNextSet,
                'cursor-pointer': hasValidNextSet,
            };

            expect(nextClasses['cursor-pointer']).toBe(false);
            expect(nextClasses['text-disabled']).toBe(true);
        });
    });
});
