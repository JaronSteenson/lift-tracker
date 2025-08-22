<template>
    <VRow>
        <VCol
            :key="index"
            class=""
            v-for="(stat, index) in stats"
            :cols="stat.cols"
        >
            <VIcon size="small">{{ stat.icon }}</VIcon>
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
                    icon: this.$svgIcons.mdiClockOutline,
                    value: hoursMinutesSecondsDuration(this.timeStats.total),
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.working,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.working) +
                        ' working',
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.warmUp,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.warmUp) +
                        ' warm-up',
                    cols: 6,
                },
                {
                    icon: this.$svgIcons.restPeriod,
                    value:
                        hoursMinutesSecondsDuration(this.timeStats.rest) +
                        ' rest',
                    cols: 6,
                },
            ];
        },
    },
};
</script>
