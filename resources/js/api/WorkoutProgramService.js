import ApiService from './ApiService';
import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { useProgramBuilderStore } from '../stores/programBuilder';
import { useRoute } from 'vue-router';
import UuidHelper from '../UuidHelper';

const RESOURCE_NAME = 'workout-programs';

const WorkoutProgramService = {
    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid);
    },

    getByRoutine(routineUuid) {
        return ApiService.get(`${RESOURCE_NAME}/by-routine/${routineUuid}`);
    },

    getAll() {
        return ApiService.get(RESOURCE_NAME);
    },

    save(workoutProgram) {
        return ApiService.saveDebounced(RESOURCE_NAME, workoutProgram);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    },
};

export default WorkoutProgramService;

export function useAllWorkoutProgramsQuery() {
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

    return { data, isPending, shouldShowNoProgramsWelcomeHint };
}

export function useSingleWorkoutProgramQuery() {
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
        return UuidHelper.findDeep(data, uuid);
    };

    const getWorkout = (uuid) => {
        return UuidHelper.find(data, uuid);
    };

    return {
        data,
        isPending,
        getWorkout,
        getExercise,
    };
}
