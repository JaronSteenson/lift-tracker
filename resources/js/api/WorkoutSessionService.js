import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-sessions';
const SET_RESOURCE_NAME = 'sessions-sets';
const EXERCISE_RESOURCE_NAME = 'sessions-exercises';

const WorkoutProgramService = {

    startNew(originWorkoutUuid) {
          return ApiService.post(`${RESOURCE_NAME}?origin-workout-uuid=${originWorkoutUuid}`)
    },

    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid)
    },

    getBySet(sessionSetUuid) {
        return ApiService.get(`${RESOURCE_NAME}?session-set-uuid=${sessionSetUuid}`)
    },

    saveSet(sessionSet) {
        return ApiService.save(SET_RESOURCE_NAME, sessionSet);
    },

    saveExercise(sessionExercise) {
        return ApiService.save(EXERCISE_RESOURCE_NAME, sessionExercise);
    },

    save(workoutProgram) {
        return ApiService.save(RESOURCE_NAME, workoutProgram);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    }

};

export default WorkoutProgramService;
