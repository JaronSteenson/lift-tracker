import ApiService from './ApiService';
import { useQuery } from '@pinia/colada';

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
    return useQuery({
        // unique key for the query in the cache
        key: () => ['allWorkoutPrograms'],
        query: async () => {
            const response = await this.getAll();
            debugger;
            return response.data;
        },
    });
}
