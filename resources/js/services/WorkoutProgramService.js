import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-programs';

// "getAll" only cache.
let cache = window.preloadData.workoutPrograms || [];

const WorkoutProgramService = {

    get(workoutRoutineId) {
        const foundInCache = cache.find(id => Number(id) === Number(workoutRoutineId));

        if (foundInCache) {
            return foundInCache;
        }

        return ApiService.get(RESOURCE_NAME, workoutRoutineId)
    },

    getAll() {
        debugger;
        if (cache) {
            return cache;
        }

        return ApiService.get(RESOURCE_NAME)
    },

    save(workoutRoutine) {
        cache = null;

        return ApiService.save(RESOURCE_NAME, workoutRoutine);
    },

};

export default WorkoutProgramService;