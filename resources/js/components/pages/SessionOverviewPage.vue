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
import { computed, toRef } from 'vue';
import SessionOverview from '../domain/workoutSessions/SessionOverview';
import NotFoundPage from '../pages/NotFoundPage';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import { useAuth } from '../domain/auth/composables/useAuth';
import { useWorkoutSession } from '../domain/workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    workoutSessionUuid: {
        type: String,
        required: true,
    },
});

const { userIsAuthenticated } = useAuth();

const { isPending, error } = useWorkoutSession(
    toRef(props, 'workoutSessionUuid'),
);

const notFound = computed(() => !isPending.value && error.value);
</script>
