import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UuidHelper from '../../../../UuidHelper/index';
import WorkoutProgramService from '../../../../api/WorkoutProgramService';

export function useWorkoutProgramList() {
    const { data, isPending } = useQuery({
        // unique key for the query in the cache
        key: () => ['allWorkoutPrograms'],
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
        key: () => ['singleWorkoutProgram', uuid],
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
