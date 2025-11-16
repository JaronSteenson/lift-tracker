import { useMutation, useQuery, useQueryCache } from '@pinia/colada';
import { computed, toRaw } from 'vue';
import { useRoute } from 'vue-router';
import UuidHelper from '../../../../UuidHelper/index';
import WorkoutProgramService from '../../../../api/WorkoutProgramService';

const WORKOUT_PROGRAM_LIST_KEY = 'workoutProgramList';
const WORKOUT_PROGRAM_KEY = 'workoutProgram';
const UPDATE_WORKOUT_PROGRAM_KEY = 'updateWorkoutProgram';

export function useWorkoutProgramList() {
    const { data, isPending } = useQuery({
        // unique key for the query in the cache
        key: () => [WORKOUT_PROGRAM_LIST_KEY],
        query: async () => {
            const response = await WorkoutProgramService.getAll();
            return response.data;
        },
    });

    const shouldShowNoProgramsWelcomeHint = computed(() => {
        return !isPending.value && (data.value?.length ?? 0) === 0;
    });

    return {
        workoutPrograms: data,
        isPending,
        shouldShowNoProgramsWelcomeHint,
    };
}

export function useWorkoutProgram() {
    const route = useRoute();
    const uuid = route.params.workoutProgramUuid;

    const { data, isPending } = useQuery({
        // unique key for the query in the cache
        key: () => [WORKOUT_PROGRAM_KEY, uuid],
        query: async () => {
            if (!uuid) {
                return undefined;
            }

            const response = await WorkoutProgramService.get(uuid);

            return response.data;
        },
    });

    const getExercise = (uuid) => {
        return UuidHelper.findDeep(data.value.workoutProgramRoutines, uuid);
    };

    const getWorkout = (uuid) => {
        return UuidHelper.findIn(data.value.workoutProgramRoutines, uuid);
    };

    return {
        workoutProgram: data,
        isPending,
        getWorkout,
        getExercise,
    };
}

export function useUpdateWorkoutProgram() {
    const queryCache = useQueryCache();

    const { mutate } = useMutation({
        key: [UPDATE_WORKOUT_PROGRAM_KEY],
        mutation(updates) {
            const key = [WORKOUT_PROGRAM_KEY, updates.uuid];
            const current = toRaw(queryCache.getQueryData(key));
            const merged = { ...current, ...updates };

            return WorkoutProgramService.save(merged);
        },

        onMutate(updates) {
            const key = [WORKOUT_PROGRAM_KEY, updates.uuid];
            queryCache.setQueryData(key, (current) => ({
                ...current,
                ...updates,
            }));

            const current = toRaw(queryCache.getQueryData(key));
            return { ...current, ...updates };
        },

        onError(_err, variables, context) {
            const key = [WORKOUT_PROGRAM_KEY, variables.uuid];
            queryCache.setQueryData(key, context.old);
        },
    });

    return { updateWorkoutProgram: mutate };
}
