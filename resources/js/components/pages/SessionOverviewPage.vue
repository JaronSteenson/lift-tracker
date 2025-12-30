<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="isPending" />
        <template v-else>
            <NotFoundPage v-if="notFound">
                Sorry we couldn't find that workout session.
            </NotFoundPage>
            <SessionOverview
                v-else
                :workout-session-uuid="workoutSessionUuid"
            />
        </template>
    </div>
</template>

<script setup>
import { computed, watch, toRef } from 'vue';
import SessionOverview from '../domain/workoutSessions/SessionOverview';
import NotFoundPage from '../pages/NotFoundPage';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import { useAppStore } from '../../stores/app';
import { useProgramBuilderStore } from '../../stores/programBuilder';
import { useWorkoutSession } from '../domain/workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    workoutSessionUuid: {
        type: String,
        required: true,
    },
});

const appStore = useAppStore();
const programBuilderStore = useProgramBuilderStore();

const { workoutSession, isPending, error } = useWorkoutSession(
    toRef(props, 'workoutSessionUuid'),
);

const userIsAuthenticated = computed(() => appStore.userIsAuthenticated);

const notFound = computed(() => !isPending.value && error.value);

// Set in focus program when workout session loads
watch(
    workoutSession,
    (session) => {
        if (session) {
            programBuilderStore.setInFocusProgramForSession(session);
        }
    },
    { immediate: true },
);
</script>
