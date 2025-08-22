import ApiService from './ApiService';

const RESOURCE_NAME = 'session-exercises';

const SessionExerciseService = {
    getHistory(sessionExerciseUuid) {
        return ApiService.get(
            `${RESOURCE_NAME}/history/${sessionExerciseUuid}`,
        );
    },
};

export default SessionExerciseService;
