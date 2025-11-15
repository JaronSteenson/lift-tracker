import ApiService from './ApiService';
import { useInfiniteQuery } from '@pinia/colada';
import { useWorkoutSessionStore } from '../stores/workoutSession';
import { computed } from 'vue';

const RESOURCE_NAME = 'workout-sessions';
const SET_RESOURCE_NAME = 'session-sets';
const EXERCISE_RESOURCE_NAME = 'session-exercises';

const WorkoutSessionService = {
    get(uuid) {
        return ApiService.get(RESOURCE_NAME, uuid);
    },

    /**
     * @return {Promise<any>}
     */
    index({ pageIndex, pageSize = 10 }) {
        return ApiService.get(
            `${RESOURCE_NAME}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
        );
    },

    getPageSize() {
        return 15;
    },

    getBySet(sessionSetUuid) {
        return ApiService.get(`${RESOURCE_NAME}/by-set/${sessionSetUuid}`);
    },

    saveSet(sessionSet) {
        return ApiService.saveDebounced(SET_RESOURCE_NAME, sessionSet);
    },

    saveExercise(sessionExercise) {
        return ApiService.saveDebounced(
            EXERCISE_RESOURCE_NAME,
            sessionExercise,
        );
    },

    save(workoutSession) {
        return ApiService.saveDebounced(RESOURCE_NAME, workoutSession);
    },

    delete(uuid) {
        return ApiService.delete(RESOURCE_NAME, uuid);
    },
};

export default WorkoutSessionService;

export function useTimelineQuery() {
    const pageSize = 10;
    const workoutSessionStore = useWorkoutSessionStore();

    const { data, isPending, loadMore } = useInfiniteQuery({
        // unique key for the query in the cache
        key: () => ['timeline'],
        query: async () => {
            if (workoutSessionStore.allPagesLoaded) {
                return [];
            }

            const response = await WorkoutSessionService.index({
                pageIndex: workoutSessionStore.pageIndex,
                pageSize,
            });

            if (response.data.length < pageSize) {
                workoutSessionStore.allPagesLoaded = true;
            }

            workoutSessionStore.pageIndex++;
            return response.data;
        },
        merge(pages, newPage) {
            // no more pages
            if (!newPage) {
                return pages;
            }

            if (!pages) {
                pages = [];
            }

            return pages.concat(newPage);
        },
    });

    const shouldShowNoProgramsHintStartNewSession = computed(() => {
        return !isPending.value && (data.value?.length ?? 0) === 0;
    });

    return {
        data,
        isPending,
        loadMore,
        shouldShowNoProgramsHintStartNewSession,
    };
}
