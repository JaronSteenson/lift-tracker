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

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, toRef } from 'vue';
import {
    useWorkoutSessionBySet,
    getExerciseBySet,
    isDuringWarmUp,
    getWarmUpTimeRemaining,
    getRestPeriodTimeRemaining,
} from './workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    sessionSetUuid: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: false,
    },
});

const { workoutSession } = useWorkoutSessionBySet(
    toRef(props, 'sessionSetUuid'),
);

const refreshForce = ref(null);
let refreshInterval = null;

const exercise = computed(() =>
    getExerciseBySet(workoutSession.value, props.sessionSetUuid),
);

const timeRemaining = computed(() => {
    // Force refresh
    refreshForce.value;

    if (isDuringWarmUp(workoutSession.value, exercise.value?.uuid)) {
        return getWarmUpTimeRemaining(
            workoutSession.value,
            exercise.value?.uuid,
        );
    }

    return getRestPeriodTimeRemaining(
        workoutSession.value,
        props.sessionSetUuid,
    );
});

const timesUp = computed(() => timeRemaining.value <= 0);

const almostFinished = computed(() => {
    if (timesUp.value) {
        return false;
    }

    return timeRemaining.value < 30;
});

const overdue = computed(() => timeRemaining.value < 0);

const _label = computed(() => {
    if (overdue.value) {
        return `${props.label} overdue`;
    }

    return `${props.label} remaining`;
});

const timerClass = computed(() => ({
    timer: true,
    'timer--almost-finished': almostFinished.value,
    'timer--overdue': overdue.value,
}));

const min = computed(() => {
    const minutes = Math.floor(Math.abs(timeRemaining.value) / 60);

    if (minutes < 10) {
        return `0${minutes}`;
    }

    return minutes;
});

const sec = computed(() => {
    const seconds = Math.abs(timeRemaining.value) - min.value * 60;

    if (seconds < 10) {
        return `0${seconds}`;
    }

    return seconds;
});

function startRefreshInterval() {
    refreshInterval = setInterval(() => {
        refreshForce.value = Date.now();
    }, 1000);
}

function playBeep() {
    /** @type HTMLAudioElement */
    const audio = document.querySelector('.js-beep-audio');
    audio.volume = 0.3;
    audio.play();
}

watch(timeRemaining, (value) => {
    if (value === 0) {
        playBeep();
    }
});

watch(timesUp, (value) => {
    if (value === true) {
        window.navigator.vibrate(200);
    } else {
        startRefreshInterval();
    }
});

onMounted(() => {
    startRefreshInterval();
});

onBeforeUnmount(() => {
    clearInterval(refreshInterval);
});
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
