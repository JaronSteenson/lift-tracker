<template>
    <div v-if="shouldShow" class="fab-container">
        <VBtn
            elevation="10"
            :to="{
                name: 'SetOverviewPage',
                params: { sessionSetUuid: inProgressSet?.uuid },
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
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useAppStore } from '../stores/app';
import { getCurrentSetForInProgressWorkout } from './domain/workoutSessions/composibles/workoutSessionQueries';

const display = useDisplay();
const appStore = useAppStore();
const route = useRoute();

// Get workout session from localStorage (since we don't have a UUID to query with)
const stored = localStorage.getItem('store-state--WorkoutSession');
const parsed = stored ? JSON.parse(stored) : {};
const workoutSession = computed(() => parsed.workoutSession || null);

const inProgressSet = computed(() =>
    getCurrentSetForInProgressWorkout(
        workoutSession.value,
        workoutSession.value?.uuid,
    ),
);

const isChangingSet = ref(false); // TODO: Get this from somewhere if needed

const shouldShow = computed(() => {
    if (!appStore.isBootstrapped && !appStore.isAuthenticated) {
        return false;
    }

    // Prevent flash on set transition
    if (isChangingSet.value) {
        return false;
    }

    if (['LoginPage', 'CheckInEditPage'].includes(route.name)) {
        return false;
    }

    if (
        route.name === 'SetOverviewPage' &&
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
}
</style>
