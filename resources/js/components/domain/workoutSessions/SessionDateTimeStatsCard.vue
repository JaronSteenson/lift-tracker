<template>
    <VCard>
        <VCardText>
            <VRow>
                <VCol
                    :key="index"
                    class="py-1"
                    cols="12"
                    sm="6"
                    v-for="(stat, index) in stats"
                >
                    <VIcon>{{ stat.icon }}</VIcon>
                    <span>{{ stat.value }}</span>
                </VCol>
            </VRow>
        </VCardText>
    </VCard>
</template>

<script>
    import {
        dateDescription,
        hoursMinutesSecondsFromStartEnd,
        timeDescription
    } from "../../../dates";

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
