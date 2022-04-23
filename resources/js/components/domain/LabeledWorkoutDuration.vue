<template>
    <div>
        <VMessages :value="['Workout duration']" class="mt-1" />
        <div class="mt-2 workout-duration">
            {{ workoutDurationDisplay }}
        </div>
    </div>
</template>

<script>
import { hoursMinutesSecondsFromStartEnd } from '../../dates';

export default {
    props: {
        workoutSession: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            refreshForce: null,
            refreshInterval: null,
        };
    },
    created() {
        this.startRefreshInterval();
    },
    destroyed() {
        this.clearRefreshInterval();
    },
    computed: {
        workoutDurationDisplay() {
            this.refreshForce;
            return hoursMinutesSecondsFromStartEnd(
                this.workoutSession.startedAt,
                this.workoutSession.endedAt
            );
        },
    },
    methods: {
        startRefreshInterval() {
            this.refreshInterval = setInterval(() => {
                this.refreshForce = Date.now();
            }, 1000);
        },
        clearRefreshInterval() {
            clearInterval(this.interval);
        },
    },
};
</script>

<style lang="scss">
.workout-duration {
    font-size: 1.5rem;
}
</style>
