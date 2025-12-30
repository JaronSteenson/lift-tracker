<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="isPending" />
        <div v-else>
            <NotFound v-if="notFound">
                Sorry we couldn't find that set.
            </NotFound>
            <template v-else>
                <SetOverview :sessionSetUuid="sessionSetUuid" />
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
import { useAppStore } from '../../stores/app';
import { useProgramBuilderStore } from '../../stores/programBuilder';
import { useWorkoutSessionBySet } from '../domain/workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    fromCheckIn: {
        type: String,
        required: false,
        default: '',
    },
    sessionSetUuid: {
        type: String,
        required: true,
    },
});

const router = useRouter();
const appStore = useAppStore();
const programBuilderStore = useProgramBuilderStore();

const { workoutSession, isPending, error } = useWorkoutSessionBySet(
    toRef(props, 'sessionSetUuid'),
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

// Handle fromCheckIn redirect
watch(
    () => props.fromCheckIn,
    async (fromCheckIn) => {
        if (fromCheckIn && !isPending.value) {
            await router.replace({
                name: 'SetOverviewPage',
                params: {
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
