<template>
    <div :class="timerClass">
        <VMessages v-if="_label" :value="[_label]" />
        <div class="timer__time-parts">
            <span class="timer__time-part">{{ min }}</span
            ><span class="timer__time-part">:</span
            ><span class="timer__time-part">{{ sec }}</span>
        </div>

        <audio ref="alarm-audio-1">
            <source src="/audio/alarm.ogg" type="audio/ogg" />
        </audio>
        <audio ref="alarm-audio-2">
            <source src="/audio/alarm.ogg" type="audio/ogg" />
        </audio>
        <audio ref="alarm-audio-3">
            <source src="/audio/alarm.ogg" type="audio/ogg" />
        </audio>
    </div>
</template>

<script>
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
    data() {
        return {
            refreshForce: null,
            refreshInterval: null,
            delayedAudioTimeout1: null,
            delayedAutoTimeout2: null,
        };
    },
    created() {
        this.startRefreshInterval();
    },
    watch: {
        timerFinished(value, oldValue) {
            // Stop the audio if the rest period has stopped by the user.
            if (value && !oldValue) {
                this.stopAudio();
            }
        },
        timeRemaining(value) {
            if (value === 10) {
                this.playWarning();
            }
            if (value === 3) {
                this.playTimeUpCountdown();
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
            return this.$store.getters['workoutSession/exerciseBySet'](
                this.sessionSetUuid
            );
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

            if (
                this.$store.getters['workoutSession/isDuringWarmUp'](
                    this.exercise.uuid
                )
            ) {
                return this.$store.getters[
                    'workoutSession/warmUpTimeRemaining'
                ](this.exercise.uuid);
            }

            return this.$store.getters[
                'workoutSession/restPeriodTimeRemaining'
            ](this.sessionSetUuid);
        },
        timerFinished() {
            if (
                this.$store.getters['workoutSession/isDuringWarmUp'](
                    this.exercise.uuid
                )
            ) {
                return false;
            }

            return this.$store.getters['workoutSession/restPeriodIsFinished'](
                this.sessionSetUuid
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
        playWarning() {
            this.playAlarm(1);
        },
        playTimeUpCountdown() {
            this.playAlarm(1);
            this.delayedAudioTimeout1 = setTimeout(() => {
                this.playAlarm(2);
            }, 1000);
            this.delayedAudioTimeout2 = setTimeout(() => {
                this.playAlarm(3);
            }, 2000);
        },
        playAlarm(i) {
            /** @type HTMLAudioElement */
            const audio = this.$refs['alarm-audio-' + i];
            audio.volume = 0.3; // Set a hard volume or else android will default to max volume sometimes.
            audio.play();
        },
        stopAudio() {
            this.clearRefreshInterval();
            this.clearDelayedAudioTimeouts();
        },
        clearRefreshInterval() {
            clearInterval(this.interval);
        },
        clearDelayedAudioTimeouts() {
            clearTimeout(this.delayedAudioTimeout1);
            clearTimeout(this.delayedAudioTimeout2);
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

    &__time-parts {
        margin-top: 15px;
    }

    &__time-part {
        font-size: 3.5em;
    }
}
</style>
