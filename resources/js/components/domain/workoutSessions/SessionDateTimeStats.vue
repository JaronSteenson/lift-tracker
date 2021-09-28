<template>
    <VRow>
        <VCol
            :key="index"
            class="date-time-stat my-0"
            cols="12"
            sm="3"
            v-for="(stat, index) in stats"
        >
            <VIcon>{{ stat.icon }}</VIcon>
            <span>{{ stat.value }}</span>
        </VCol>
    </VRow>
</template>

<script>
    import {dateDescription, hoursMinutesSecondsFromStartEnd, timeDescription} from "../../../dates";

    export default {
        props: {
            workoutSession: {
                type: Object,
                required: true,
            }
        },
        computed: {
            stats() {
                return [
                    {
                        icon: this.$svgIcons.sessionDate,
                        value: dateDescription(this.workoutSession.startedAt)
                    },
                    {
                        icon: this.$svgIcons.mdiClockOutline,
                        value: hoursMinutesSecondsFromStartEnd(
                            this.workoutSession.startedAt,
                            this.workoutSession.endedAt
                        ),
                    },
                    {
                        icon: this.$svgIcons.mdiPlay,
                        value: timeDescription(this.workoutSession.startedAt, true)
                    },
                    {
                        icon: this.$svgIcons.mdiStop,
                        value: timeDescription(this.workoutSession.endedAt, true)
                    },
                ]
            }
        }
    }
</script>

<style lang="scss" scoped>
    .date-time-stat {
        @media (max-width: 600px) {
            max-width: 50%;
        }
    }
</style>
