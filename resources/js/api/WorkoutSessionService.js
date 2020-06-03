import ApiService from './ApiService';

const RESOURCE_NAME = 'workout-sessions';

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

    save(workoutProgram) {
        return ApiService.save(RESOURCE_NAME, workoutProgram);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    }

};

export default WorkoutProgramService;
