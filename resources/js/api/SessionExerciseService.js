import ApiService from './ApiService';

const RESOURCE_NAME = 'session-exercises';

const SessionExerciseService = {
    getHistory(sessionExerciseUuid, { pageIndex, pageSize = 10 } = {}) {
        return ApiService.get(
            `${RESOURCE_NAME}/history/${sessionExerciseUuid}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        );
    },
};

export default SessionExerciseService;
