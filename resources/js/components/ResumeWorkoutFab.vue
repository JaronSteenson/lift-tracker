<template>
    <div class="fab-container">
        <VBtn
            elevation="1"
            v-if="shouldShow"
            :to="{
                name: 'SetOverviewPage',
                params: { sessionSetUuid: resolvedTargetSetUuid },
            }"
            color="secondary"
            size="large"
            title="Resume workout"
        >
            <span class="text-primary">Resume workout</span>
            <VIcon color="green" size="large">
                {{ $svgIcons.mdiPlayPause }}
            </VIcon>
        </VBtn>
    </div>
</template>

<script>
import { useWorkoutSessionStore } from '../stores/workoutSession';

export default {
    name: 'ResumeWorkoutFab',
    props: {
        currentSetUuid: {
            type: String,
            default: null,
        },
        targetSetUuid: {
            type: String,
            default: null,
        },
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        return { workoutSessionStore };
    },
    computed: {
        inProgressSet() {
            return this.workoutSessionStore.currentSetForInProgressWorkout(
                this.workoutSessionStore.uuid,
            );
        },
        shouldShow() {
            // If no in-progress set, don't show
            if (!this.inProgressSet) {
                return false;
            }

            // If currentSetUuid is provided, only show when it's different from in-progress set
            if (this.currentSetUuid) {
                return this.currentSetUuid !== this.inProgressSet.uuid;
            }

            // Default: show if there's an in-progress set
            return true;
        },
        resolvedTargetSetUuid() {
            return this.targetSetUuid || this.inProgressSet?.uuid;
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
