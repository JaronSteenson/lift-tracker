<template>
    <VRow>
        <VCol
            :key="index"
            class="py-0"
            v-for="(stat, index) in stats"
            :cols="stat.cols"
        >
            <VIcon small>{{ stat.icon }}</VIcon>
            <span>{{ stat.value }}</span>
        </VCol>
    </VRow>
</template>
<script>
import {
    dateDescription,
    hoursMinutesSecondsFromStartEnd,
    timeDescription,
} from '../../../dates';

export default {
    props: {
        workoutSession: {
            type: Object,
            required: true,
        },
    },
    computed: {
        stats() {
            return [
                {
                    icon: this.$svgIcons.bodyWeight,
                    value: this.workoutSession.bodyWeight
                        ? `${Number(this.workoutSession.bodyWeight)
                              .toFixed(2)
                              .replace(/\.00$/, '')}kg body weight`
                        : 'Unknown body weight',
                    cols: 12,
                },
                {
                    icon: this.$svgIcons.sessionDate,
                    value: dateDescription(this.workoutSession.startedAt),
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.duration,
                    value: hoursMinutesSecondsFromStartEnd(
                        this.workoutSession.startedAt,
                        this.workoutSession.endedAt
                    ),
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.mdiPlay,
                    value: timeDescription(this.workoutSession.startedAt, true),
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.mdiStop,
                    value: timeDescription(this.workoutSession.endedAt, true),
                    cols: 6,
                },
            ];
        },
    },
};
</script>
