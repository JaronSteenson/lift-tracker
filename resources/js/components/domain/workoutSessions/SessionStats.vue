<template>
    <VRow>
        <VCol :key="index" class="py-0" cols="6" v-for="(stat, index) in stats">
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
                        ? `${this.workoutSession.bodyWeight}kg`
                        : 'Unknown body weight',
                },
                {
                    icon: '',
                    value: '',
                },
                {
                    icon: this.$svgIcons.sessionDate,
                    value: dateDescription(this.workoutSession.startedAt),
                },
                {
                    icon: this.$svgIcons.duration,
                    value: hoursMinutesSecondsFromStartEnd(
                        this.workoutSession.startedAt,
                        this.workoutSession.endedAt
                    ),
                },
                {
                    icon: this.$svgIcons.mdiPlay,
                    value: timeDescription(this.workoutSession.startedAt, true),
                },
                {
                    icon: this.$svgIcons.mdiStop,
                    value: timeDescription(this.workoutSession.endedAt, true),
                },
            ];
        },
    },
};
</script>
