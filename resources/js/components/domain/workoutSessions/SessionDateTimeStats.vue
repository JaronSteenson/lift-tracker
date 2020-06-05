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
    import {dateDescription, hoursMinutesFromStartEnd, timeDescription} from "../../../filters";

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
                        icon: 'mdi-calendar',
                        value: dateDescription(this.workoutSession.startedAt)
                    },
                    {
                        icon: 'mdi-clock-outline',
                        value: hoursMinutesFromStartEnd(
                            this.workoutSession.startedAt,
                            this.workoutSession.endedAt
                        ),
                    },
                    {
                        icon: 'mdi-play',
                        value: timeDescription(this.workoutSession.startedAt, true)
                    },
                    {
                        icon: 'mdi-stop',
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
