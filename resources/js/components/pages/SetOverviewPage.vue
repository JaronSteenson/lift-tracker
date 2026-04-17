<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="isPending" />
        <div v-else>
            <NotFound v-if="notFound">
                Sorry we couldn't find that set.
            </NotFound>
            <template v-else>
                <SetOverview
                    :workout-session-uuid="workoutSessionUuid"
                    :session-set-uuid="sessionSetUuid"
                />
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, watch, toRef } from 'vue';
import { useRouter } from 'vue-router';
import NotFound from '../routing/NotFound';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import SetOverview from '../domain/workoutSessions/SetOverview';
import { useAuth } from '../domain/auth/composables/useAuth';
import {
    getSet,
    useWorkoutSession,
} from '../domain/workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    fromCheckIn: {
        type: String,
        required: false,
        default: '',
    },
    workoutSessionUuid: {
        type: String,
        required: true,
    },
    sessionSetUuid: {
        type: String,
        required: true,
    },
});

const router = useRouter();
const { userIsAuthenticated } = useAuth();

const {
    workoutSession: workoutSessionData,
    isPending,
    error,
} = useWorkoutSession(toRef(props, 'workoutSessionUuid'));
const notFound = computed(() => {
    if (isPending.value) {
        return false;
    }

    if (error.value) {
        return true;
    }

    if (!workoutSessionData.value) {
        return false;
    }

    return !getSet(workoutSessionData.value, props.sessionSetUuid);
});

// Handle fromCheckIn redirect
watch(
    () => props.fromCheckIn,
    async (fromCheckIn) => {
        if (fromCheckIn && props.workoutSessionUuid && !isPending.value) {
            await router.replace({
                name: 'SetOverviewPage',
                params: {
                    workoutSessionUuid: props.workoutSessionUuid,
                    sessionSetUuid: props.sessionSetUuid,
                    fromCheckIn: '',
                },
            });
        }
    },
    { immediate: true },
);
</script>

<style lang="scss"></style>
