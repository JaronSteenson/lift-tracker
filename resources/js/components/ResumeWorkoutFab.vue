<template>
    <div v-if="shouldShow" class="fab-container">
        <VBtn
            elevation="10"
            :to="{
                name: 'SetOverviewPage',
                params: {
                    workoutSessionUuid: workoutSession?.uuid,
                    sessionSetUuid: inProgressSet?.uuid,
                },
            }"
            rounded
            color="secondary"
            size="large"
            title="Resume workout"
        >
            <span v-if="display.mdAndUp.value" class="text-primary">
                Resume workout
            </span>
            <span v-else class="text-primary">Resume</span>
            <VIcon color="green" size="large">
                {{ $svgIcons.mdiPlay }}
            </VIcon>
        </VBtn>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useAuth } from './domain/auth/composables/useAuth';
import {
    getCurrentSetForInProgressWorkout,
    useInProgressWorkout,
    useSetChangeTransition,
} from './domain/workoutSessions/composibles/workoutSessionQueries';

const display = useDisplay();
const { isBootstrapped, isAuthenticated } = useAuth();
const route = useRoute();
const { workoutSession } = useInProgressWorkout();
const { isSetChangeTransitioning } = useSetChangeTransition();

const inProgressSet = computed(() =>
    getCurrentSetForInProgressWorkout(
        workoutSession.value,
        workoutSession.value?.uuid,
    ),
);

const shouldShow = computed(() => {
    if (!isBootstrapped.value || !isAuthenticated.value) {
        return false;
    }

    if (isSetChangeTransitioning.value) {
        return false;
    }

    if (['LoginPage', 'CheckInEditPage'].includes(route.name)) {
        return false;
    }

    if (
        route.name === 'SetOverviewPage' &&
        route.params?.workoutSessionUuid === workoutSession.value?.uuid &&
        route.params?.sessionSetUuid === inProgressSet.value?.uuid
    ) {
        return false;
    }

    return Boolean(inProgressSet.value);
});
</script>

<style scoped>
.fab-container {
    position: fixed;
    bottom: 2em;
    right: 2em;
    z-index: 1000;
    transition: opacity 0.15s ease;
}
</style>
