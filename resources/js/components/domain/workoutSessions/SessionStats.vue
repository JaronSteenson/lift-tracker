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
import { hoursMinutesSecondsDuration } from '../../../dates';

export default {
    props: {
        workoutSession: {
            type: Object,
            required: true,
        },
        timeStats: {
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
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.mdiClockOutline,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.total) +
                        ' total duration',
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.working,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.working) +
                        ' total working',
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.warmUp,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.warmUp) +
                        ' total warm-up',
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.restPeriod,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.rest) +
                        ' total rest',
                    cols: 6,
                },
            ];
        },
    },
};
</script>
