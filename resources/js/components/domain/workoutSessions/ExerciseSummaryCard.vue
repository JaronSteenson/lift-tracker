<template>
    <VCard>
        <VCardTitle>
            {{ exercise.name }}
        </VCardTitle>
        <VCardSubtitle v-if="$vuetify.breakpoint.xsOnly">
            <span :class="`pt-1 font-weight-bold text--primary`">
                +{{ exercise.duration }},
            </span>
            <span>{{ exercise.startedAt }}</span>
        </VCardSubtitle>
        <VCardText class="mb-0 pb-0">
            <div
                class="pb-1"
                :key="index"
                v-for="(weightGroup, index) in weightGroups"
            >
                <VIcon small>
                    {{ $svgIcons.mdiDumbbell }}
                </VIcon>
                {{ weightGroup.weight }} x
                <template
                    v-for="(repBreakDown, index) in weightGroup.repBreakDown"
                >
                    <RouterLink :key="repBreakDown.uuid" :to="repBreakDown.to">
                        {{ repBreakDown.text }}</RouterLink
                    ><template
                        v-if="index < weightGroup.repBreakDown.length - 1"
                        >,
                    </template>
                </template>
            </div>
            <div v-if="totalDuration" class="pb-1">
                <VIcon small>
                    {{ $svgIcons.mdiClockOutline }}
                </VIcon>
                {{ totalDuration }} total duration
            </div>
            <div v-if="totalWarmUp" class="pb-1">
                <VIcon small>
                    {{ $svgIcons.warmUp }}
                </VIcon>
                {{ totalWarmUp }} warm-up
            </div>
            <div v-if="averageRestPeriod" class="pb-1">
                <VIcon small>
                    {{ $svgIcons.restPeriod }}
                </VIcon>
                {{ averageRestPeriod }} average rest
            </div>
            <div v-if="averageRestPeriod" class="mt-2">
                <VTextarea
                    v-if="exercise.notes && exercise.notes.trim().length > 0"
                    label="Notes"
                    :value="exercise.notes"
                    readonly
                    outlined
                />
            </div>
        </VCardText>
        <VCardActions class="mt-0 pt-0">
            <VBtn
                small
                :to="{
                    name: 'SetOverviewPage',
                    params: { sessionSetUuid: firstSet.uuid },
                }"
                >View
                <VIcon small color="success">{{
                    $svgIcons.mdiClipboardTextOutline
                }}</VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>

<script>
import {
    hoursMinutesSecondsFromStartEnd,
    minsSecDuration,
} from '../../../dates';

export default {
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
        weightGroups() {
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

            return weightGroups.map((weightGroup) => {
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
        },
        totalDuration() {
            const startedAt = this.firstSet.startedAt;
            const endedAt = this.lastSet.endedAt;

            if (!startedAt) {
                return undefined;
            }

            return hoursMinutesSecondsFromStartEnd(startedAt, endedAt);
        },
        averageRestPeriod() {
            const setsWithoutLast = [...this.exercise.sessionSets];

            // We don't record the rest period on the last set.
            setsWithoutLast.pop();

            const totalRest = setsWithoutLast.reduce(
                (runningTotal, set) => set.restPeriodDuration + runningTotal,
                0
            );

            const average = totalRest / setsWithoutLast.length;

            if (average === 0) {
                return undefined;
            }

            return minsSecDuration(average);
        },
        totalWarmUp() {
            if (!this.exercise.warmUpEndedAt) {
                return undefined;
            }

            return hoursMinutesSecondsFromStartEnd(
                this.exercise.warmUpStartedAt,
                this.exercise.warmUpEndedAt
            );
        },
    },
};
</script>
