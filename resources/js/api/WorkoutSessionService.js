import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-session';

const WorkoutProgramService = {

    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid)
    },

    save(workoutProgram) {
        return ApiService.save(RESOURCE_NAME, workoutProgram);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    }

};

export default WorkoutProgramService;
