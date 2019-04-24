import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-programs';

const WorkoutRoutineService = {

    get(workoutRoutineId) {
        return ApiService.get(RESOURCE_NAME, workoutRoutineId)
    },

    save(workoutRoutine) {
        return ApiService.save(RESOURCE_NAME, workoutRoutine);
    },

};

export default WorkoutRoutineService;