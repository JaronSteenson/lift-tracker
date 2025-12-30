import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { isToday } from 'date-fns';
import { utcNow } from '../../../../dates';
import UuidHelper from '../../../../UuidHelper/index';
import WorkoutSessionService from '../../../../api/WorkoutSessionService';
import createSessionFromBuilderWorkout from '../../../../domain/createSessionFromBuilderWorkout';
import { useAppStore } from '../../../../stores/app';

const WORKOUT_SESSION_KEY = 'workoutSession';

export function useStartWorkout() {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ originWorkout, myWorkoutSessions }) => {
            const appStore = useAppStore();

            const existingCheckIn = myWorkoutSessions.find(
                (session) => isToday(session.createdAt) && !session.startedAt,
            );

            // Create a new workout session from the routine
            const sessionData = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            // Save the session
            if (appStore.localOnlyUser) {
                sessionData.updatedAt = utcNow();
                sessionData.createdAt = sessionData.createdAt || utcNow();
                return sessionData;
            } else {
                const response = await WorkoutSessionService.save(sessionData);
                return response.data;
            }
        },

        onSuccess: (workoutSession, variables) => {
            // Update the workout session cache
            queryClient.setQueryData([WORKOUT_SESSION_KEY], workoutSession);

            // Update myWorkoutSessions list
            const updatedSessions = UuidHelper.replaceInCopy(
                variables.myWorkoutSessions,
                workoutSession,
                true,
            );

            // TODO: Update the timeline/sessions list cache when that's migrated
            // For now, we'll rely on the store for myWorkoutSessions

            // Save to localStorage (for compatibility with existing code)
            const workoutSessionStore = {
                workoutSession,
                myWorkoutSessions: updatedSessions,
            };
            localStorage.setItem(
                'store-state--WorkoutSession',
                JSON.stringify(workoutSessionStore),
            );
        },

        onError: (error) => {
            console.error('Error starting workout:', error);
        },
    });

    return {
        startWorkout: mutate,
        isStarting: isPending,
    };
}
