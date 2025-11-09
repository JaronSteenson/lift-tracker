import ApiService from './ApiService';
import { useQuery } from '@pinia/colada';
const RESOURCE_NAME = 'workout-sessions';
const SET_RESOURCE_NAME = 'session-sets';
const EXERCISE_RESOURCE_NAME = 'session-exercises';

const WorkoutSessionService = {
    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid);
    },

    /**
     * @return {Promise<any>}
     */
    index({ pageIndex, pageSize = 10 }) {
        return ApiService.get(
            `${RESOURCE_NAME}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        );
    },

    getPageSize() {
        return 15;
    },

    getBySet(sessionSetUuid) {
        return ApiService.get(`${RESOURCE_NAME}/by-set/${sessionSetUuid}`);
    },

    saveSet(sessionSet) {
        return ApiService.saveDebounced(SET_RESOURCE_NAME, sessionSet);
    },

    saveExercise(sessionExercise) {
        return ApiService.saveDebounced(
            EXERCISE_RESOURCE_NAME,
            sessionExercise,
        );
    },

    save(workoutSession) {
        return ApiService.saveDebounced(RESOURCE_NAME, workoutSession);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    },
};

export default WorkoutSessionService;

export function useTimelineQuery(pageIndex, pageSize) {
    return useQuery({
        // unique key for the query in the cache
        key: () => ['timeline', pageIndex, pageSize],
        query: async () => {
            const response = await WorkoutSessionService.index({
                pageIndex,
                pageSize,
            });

            return response.data;
        },
    });
}
