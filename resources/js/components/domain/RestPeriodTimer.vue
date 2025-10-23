<template>
    <div :class="timerClass">
        <VMessages v-if="_label" :value="[_label]" />
        <div class="timer__time-parts">
            <span class="timer__time-part">{{ min }}</span>
            <span class="timer__time-part">:</span>
            <span class="timer__time-part">{{ sec }}</span>
        </div>
    </div>
</template>

<script>
import { useWorkoutSessionStore } from '../../stores/workoutSession';

export default {
    props: {
        sessionSetUuid: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: false,
        },
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        return { workoutSessionStore };
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
    beforeDestroy() {
        clearInterval(this.interval);
    },
    watch: {
        timeRemaining(value) {
            if (value === 10) {
                this.playBeep();
            }
            if (value === 0) {
                this.playBeep();
            }
        },
        timesUp(value) {
            if (value === true) {
                window.navigator.vibrate(200);
            } else {
                this.startRefreshInterval();
            }
        },
    },
    computed: {
        exercise() {
            return this.workoutSessionStore.exerciseBySet(this.sessionSetUuid);
        },
        _label() {
            if (this.overdue) {
                return `${this.label} overdue`;
            }

            return `${this.label} remaining`;
        },
        timerClass() {
            return {
                timer: true,
                'timer--almost-finished': this.almostFinished,
                'timer--overdue': this.overdue,
            };
        },
        timeRemaining() {
            this.refreshForce;

            if (this.workoutSessionStore.isDuringWarmUp(this.exercise.uuid)) {
                return this.workoutSessionStore.warmUpTimeRemaining(
                    this.exercise.uuid,
                );
            }

            return this.workoutSessionStore.restPeriodTimeRemaining(
                this.sessionSetUuid,
            );
        },
        timesUp() {
            return this.timeRemaining <= 0;
        },
        almostFinished() {
            if (this.timesUp) {
                return false;
            }

            return this.timeRemaining < 30;
        },
        overdue() {
            return this.timeRemaining < 0;
        },
        min() {
            const min = Math.floor(Math.abs(this.timeRemaining) / 60);

            if (min < 10) {
                return `0${min}`;
            }

            return min;
        },
        sec() {
            const sec = Math.abs(this.timeRemaining) - this.min * 60;

            if (sec < 10) {
                return `0${sec}`;
            }

            return sec;
        },
    },
    methods: {
        startRefreshInterval() {
            this.refreshInterval = setInterval(() => {
                this.refreshForce = Date.now();
            }, 1000);
        },
        playBeep() {
            /** @type HTMLAudioElement */
            const audio = document.querySelector('.js-beep-audio');
            audio.play();
        },
    },
};
</script>

<style lang="scss">
.timer {
    &--almost-finished {
        color: var(--v-warning-base);
    }

    &--overdue {
        color: var(--v-error-base);
    }

    &__time-part {
        font-size: 3.5em;
    }
}
</style>
