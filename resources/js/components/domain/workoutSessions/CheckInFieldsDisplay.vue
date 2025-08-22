<template>
    <div>
        <VRow>
            <VCol
                :key="index"
                class="py-1"
                v-for="(stat, index) in allStats"
                :cols="stat.cols"
            >
                <VIcon size="small">{{ stat.icon }}</VIcon>
                <span class="pl-2">{{ stat.value }}</span>
            </VCol>
        </VRow>
        <VRow class="pb-0">
            <VCol class="pb-0">
                <VTextarea
                    v-if="
                        workoutSession.notes &&
                        workoutSession.notes.trim().length > 0
                    "
                    class="mt-2"
                    :value="workoutSession.notes"
                    readonly
                    variant="outlined"
                />
            </VCol>
        </VRow>
    </div>
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
            required: false,
        },
    },
    computed: {
        checkInStats() {
            return [
                {
                    icon: this.$svgIcons.bodyWeight,
                    value: this.workoutSession.bodyWeight
                        ? `${Number(
                              this.workoutSession.bodyWeight,
                          ).toLocaleString('en-US', {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 4,
                          })}kg`
                        : 'Not recorded',
                    cols: 6,
                },
            ];
        },
        sessionStats() {
            if (!this.timeStats || !this.workoutSession.startedAt) {
                return [];
            }
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
        allStats() {
            return [...this.checkInStats, ...this.sessionStats];
        },
    },
};
</script>
