import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-routines';

const WorkoutProgramService = {

    getAll() {
        return ApiService.get(RESOURCE_NAME)
    },

};

export default WorkoutProgramService;
