import ApiService from './ApiService';

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
        return ApiService.save(SET_RESOURCE_NAME, sessionSet);
    },

    saveExercise(sessionExercise) {
        return ApiService.save(EXERCISE_RESOURCE_NAME, sessionExercise);
    },

    save(workoutSession) {
        return ApiService.save(RESOURCE_NAME, workoutSession);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    },
};

export default WorkoutSessionService;
