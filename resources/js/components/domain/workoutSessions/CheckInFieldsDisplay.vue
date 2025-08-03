<template>
    <div>
        <div
            :key="index"
            class="py-0"
            v-for="(stat, index) in stats"
            :cols="stat.cols"
        >
            <VIcon small>{{ stat.icon }}</VIcon>
            <span>{{ stat.value }}</span>
        </div>
        <VTextarea
            v-if="
                workoutSession.notes && workoutSession.notes.trim().length > 0
            "
            class="mt-4"
            label="Notes"
            :value="workoutSession.notes"
            readonly
            outlined
        />
    </div>
</template>
<script>
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
                        ? `${Number(
                              this.workoutSession.bodyWeight
                          ).toLocaleString('en-US', {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 4,
                          })}kg`
                        : 'Not recorded',
                    cols: 6,
                },
            ];
        },
    },
};
</script>
