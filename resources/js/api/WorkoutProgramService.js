import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-programs';

const WorkoutProgramService = {

    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid)
    },

    getAll() {
        return ApiService.get(RESOURCE_NAME)
    },

    save(workoutProgram) {
        return ApiService.save(RESOURCE_NAME, workoutProgram);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    }

};

export default WorkoutProgramService;
