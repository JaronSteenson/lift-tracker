import ApiService from './ApiService';

const RESOURCE_NAME = 'session-exercises';

const SessionExerciseService = {
    getHistory(sessionExerciseUuid, { pageIndex, pageSize = 10 } = {}) {
        return ApiService.get(
            `${RESOURCE_NAME}/history/${sessionExerciseUuid}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        );
    },

    getCycleProjection(
        exerciseUuid,
        { trainingMax, currentCycleWeek, bodyType } = {},
    ) {
        const searchParams = new URLSearchParams();

        if (trainingMax !== null && trainingMax !== undefined) {
            searchParams.set('trainingMax', trainingMax);
        }

        if (currentCycleWeek !== null && currentCycleWeek !== undefined) {
            searchParams.set('currentCycleWeek', currentCycleWeek);
        }

        if (bodyType !== null && bodyType !== undefined) {
            searchParams.set('bodyType', bodyType);
        }

        const query = searchParams.toString();
        return ApiService.get(
            `exercise/${exerciseUuid}/cycle-projection${
                query ? `?${query}` : ''
            }`,
        );
    },
};

export default SessionExerciseService;
