<template>
    <div v-if="shouldShow" class="fab-container">
        <VBtn
            elevation="5"
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

<script>
import { useWorkoutSessionStore } from '../stores/workoutSession';
import { useDisplay } from 'vuetify';
import { useAppStore } from '../stores/app';

export default {
    name: 'ResumeWorkoutFab',
    setup() {
        const display = useDisplay();
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();
        return { display, appStore, workoutSessionStore };
    },
    computed: {
        inProgressSet() {
            return this.workoutSessionStore.currentSetForInProgressWorkout(
                this.workoutSessionStore.uuid,
            );
        },
        shouldShow() {
            if (
                !this.appStore.isBootstrapped &&
                !this.appStore.isAuthenticated
            ) {
                return false;
            }

            // Prevent flash on set transition.
            if (this.workoutSessionStore.isChangingSet) {
                return false;
            }

            if (['LoginPage', 'CheckInEditPage'].includes(this.$route.name)) {
                return false;
            }

            if (
                this.$route.name === 'SetOverviewPage' &&
                this.$route.params?.sessionSetUuid === this.inProgressSet?.uuid
            ) {
                return false;
            }

            return Boolean(this.inProgressSet);
        },
    },
};
</script>

<style scoped>
.fab-container {
    position: fixed;
    bottom: 2em;
    right: 2em;
    z-index: 1000;
}
</style>
