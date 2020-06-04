<template>
    <div :class="timerClass">
        <VMessages v-if="label" :value="[label]"/>
        <div class="timer__time-parts">
            <span class="timer__time-part">{{ min }}</span><span class="timer__time-part">:</span><span class="timer__time-part">{{ sec }}</span>
        </div>
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
            }
        },
        data() {
            return {
                refreshForce: null,
                refreshInterval: null,
            }
        },
        created() {
            if (!this.isFinished) {
                this.startRefreshInterval();
            }
        },
        destroyed() {
            this.clearRefreshInterval();
        },
        watch: {
            isFinished(value) {
                if (value === true) {
                    this.clearRefreshInterval();
                } else {
                    this.startRefreshInterval()
                }
            }
        },
        computed: {
            timerClass() {
                return {
                    'timer': true,
                    'timer--almost-finished': this.almostFinished,
                }
            },
            timeRemaining() {
                this.refreshForce;
                return this.$store.getters['workoutSession/restPeriodTimeRemaining'](this.sessionSetUuid);
            },
            isFinished() {
                return this.timeRemaining <= 0;
            },
            almostFinished() {
                if (this.isFinished) {
                    return false;
                }

                return this.timeRemaining < 30;
            },
            min() {
                if (this.isFinished) {
                    return '00';
                }

                const min = Math.floor(this.timeRemaining / 60);

                if (min < 10) {
                    return `0${min}`;
                }

                return min;
            },
            sec() {
                if (this.isFinished) {
                    return '00';
                }

                const sec = this.timeRemaining - this.min * 60;

                if (sec < 10) {
                    return `0${sec}`;
                }

                return sec;
            },
        },
        methods: {
            startRefreshInterval() {
                this.refreshInterval = setInterval(() => {
                    this.refreshForce =  Date.now();
                }, 1000);
            },
            clearRefreshInterval() {
                clearInterval(this.interval);
            }
        }
    }
</script>

<style lang="scss">
    .timer {
        &--almost-finished {
            color: var(--v-warning-base);
        }

        &__time-parts {
            margin-top: 15px;
        }

        &__time-part {
            font-size: 3.5em;
        }
    }
</style>
