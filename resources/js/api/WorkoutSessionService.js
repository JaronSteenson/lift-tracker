import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-sessions';
const WorkoutSessionService = {
    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid);
    },

    getInProgress() {
        return ApiService.get(`${RESOURCE_NAME}/in-progress`);
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

    save(workoutSession) {
        return ApiService.save(RESOURCE_NAME, workoutSession);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    },
};

export default WorkoutSessionService;
