<template>
    <!--    Should match  CheckInFieldsDisplay  -->
    <VCard>
        <VCardTitle>
            {{ exercise.name }}
        </VCardTitle>
        <VCardSubtitle v-if="display.xs.value">
            <span class="font-weight-bold text-primary">
                +{{ exercise.duration }},
            </span>
            <span>{{ exercise.startedAt }}</span>
        </VCardSubtitle>
        <VCardText>
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
            <VRow class="pt-4">
                <VTextarea
                    v-if="exercise.notes && exercise.notes.trim().length > 0"
                    :value="exercise.notes"
                    readonly
                    variant="outlined"
                />
            </VRow>
        </VCardText>
        <VCardActions>
            <VBtn
                elevation="1"
                size="small"
                :to="{
                    name: 'SetOverviewPage',
                    params: { sessionSetUuid: firstSet.uuid },
                }"
            >
                Edit
                <VIcon size="small" color="success">
                    {{ $svgIcons.mdiClipboardTextOutline }}
                </VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>

<script>
import {
    hoursMinutesSecondsFromStartEnd,
    minsSecDuration,
} from '../../../dates';
import { useDisplay } from 'vuetify';

export default {
    setup() {
        const display = useDisplay();
        return { display };
    },
    props: {
        exercise: {
            type: Object,
            required: true,
        },
    },
    computed: {
        firstSet() {
            return this.exercise.sessionSets[0];
        },
        lastSet() {
            return this.exercise.sessionSets[
                this.exercise.sessionSets.length - 1
            ];
        },
        allStats() {
            return [
                this.weightAndReps,
                this.totalDuration,
                this.totalWarmUp,
                this.averageRestPeriod,
            ].filter(Boolean);
        },
        weightAndReps() {
            let weightGroups = [];

            this.exercise.sessionSets.forEach((set) => {
                if (weightGroups.length === 0) {
                    weightGroups.push([set]);
                    return;
                }

                const lastWeightGroup = weightGroups[weightGroups.length - 1];
                const lastWeight =
                    lastWeightGroup[lastWeightGroup.length - 1].weight;

                if (lastWeight === set.weight) {
                    lastWeightGroup.push(set);
                } else {
                    weightGroups.push([set]);
                }
            });

            const repsByWeight = weightGroups.map((weightGroup) => {
                const weight = weightGroup[0].weight
                    ? `${weightGroup[0].weight}kg`
                    : '?kg';

                const repBreakDown = weightGroup.map((set) => {
                    return {
                        uuid: set.uuid,
                        text: set.reps ?? '?',
                        to: {
                            name: 'SetOverviewPage',
                            params: { sessionSetUuid: set.uuid },
                        },
                    };
                });

                return {
                    weight,
                    repBreakDown,
                };
            });

            const value = repsByWeight
                .map(
                    ({ weight, repBreakDown }) =>
                        `${weight} -  ${repBreakDown.map((r) => r.text).join(', ')}`,
                )
                .join(' | ');

            return { icon: this.$svgIcons.mdiDumbbell, cols: 12, value };
        },
        totalDuration() {
            const startedAt = this.firstSet.startedAt;
            const endedAt = this.lastSet.endedAt;

            if (!startedAt) {
                return undefined;
            }

            const value = hoursMinutesSecondsFromStartEnd(startedAt, endedAt);

            return { icon: this.$svgIcons.mdiClockOutline, cols: 12, value };
        },
        totalWarmUp() {
            if (!this.exercise.warmUpEndedAt) {
                return undefined;
            }

            const value = hoursMinutesSecondsFromStartEnd(
                this.exercise.warmUpStartedAt,
                this.exercise.warmUpEndedAt,
            );

            return { icon: this.$svgIcons.warmUp, cols: 12, value };
        },
        averageRestPeriod() {
            const setsWithoutLast = [...this.exercise.sessionSets];

            // We don't record the rest period on the last set.
            setsWithoutLast.pop();

            const totalRest = setsWithoutLast.reduce(
                (runningTotal, set) => set.restPeriodDuration + runningTotal,
                0,
            );

            const average = totalRest / setsWithoutLast.length;

            if (average === 0) {
                return undefined;
            }

            const value = minsSecDuration(average);

            return { icon: this.$svgIcons.restPeriod, cols: 12, value };
        },
    },
};
</script>
