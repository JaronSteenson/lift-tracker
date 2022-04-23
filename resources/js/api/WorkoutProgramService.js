import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-programs';

const WorkoutProgramService = {
    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid);
    },

    getByRoutine(routineUuid) {
        return ApiService.get(`${RESOURCE_NAME}?routine-uuid=${routineUuid}`);
    },

    getAll() {
        return ApiService.get(RESOURCE_NAME);
    },

    save(workoutProgram) {
        return ApiService.save(RESOURCE_NAME, workoutProgram);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    },
};

export default WorkoutProgramService;
