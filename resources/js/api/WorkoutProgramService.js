import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-programs';

const WorkoutProgramService = {

    get(workoutRoutineId) {
        return ApiService.get(RESOURCE_NAME, workoutRoutineId)
    },

    getAll() {
        return ApiService.get(RESOURCE_NAME)
    },

    save(workoutRoutine) {
        return ApiService.save(RESOURCE_NAME, workoutRoutine);
    },

};

export default WorkoutProgramService;
