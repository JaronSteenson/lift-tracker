<template>
    <VCard>
        <VCardTitle>
            <RouterLink
                :to="{
                    name: 'SetOverviewPage',
                    params: { sessionSetUuid: firstSet.uuid },
                }"
            >
                {{ exercise.name }}
            </RouterLink>
        </VCardTitle>
        <VCardText>
            <VRow>
                <VCol
                    class="py-0"
                    cols="6"
                    :key="index"
                    v-for="(weightGroup, index) in weightGroups"
                >
                    <VIcon small>
                        {{ $svgIcons.mdiDumbbell }}
                    </VIcon>
                    {{ weightGroup.weight }}:
                    <template
                        v-for="(
                            repBreakDown, index
                        ) in weightGroup.repBreakDown"
                    >
                        <RouterLink
                            :key="repBreakDown.uuid"
                            :to="repBreakDown.to"
                        >
                            {{ repBreakDown.text }}</RouterLink
                        ><template
                            v-if="index < weightGroup.repBreakDown.length - 1"
                            >,
                        </template>
                    </template>
                </VCol>
                <VCol class="py-0" cols="6">
                    <VIcon small>
                        {{ $svgIcons.duration }}
                    </VIcon>
                    {{ totalDuration }}
                </VCol>
                <VCol class="py-0" cols="6">
                    <VIcon small>
                        {{ $svgIcons.restPeriod }}
                    </VIcon>
                    {{ averageRestPeriod }}
                </VCol>
                <VCol class="py-0" cols="6">
                    <VIcon small>
                        {{ $svgIcons.mdiChartLineVariant }}
                    </VIcon>
                    <RouterLink
                        :to="{ $route, ...{ query: { 'stats-open': true } } }"
                    >
                        Overview
                    </RouterLink>
                </VCol>
            </VRow>
        </VCardText>
        <SessionExerciseStatsModal
            url-search-param="stats-open"
            :session-exercises="[exercise]"
            v-model="showStatsModal"
        />
    </VCard>
</template>

<script>
import {
    hoursMinutesSecondsFromStartEnd,
    minsSecDuration,
} from '../../../dates';
import SessionExerciseStatsModal from './SessionExerciseStatsModal';

export default {
    components: {
        SessionExerciseStatsModal,
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
                    : 'Unknown weight';

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
                return 'Not started';
            }

            return `${hoursMinutesSecondsFromStartEnd(
                startedAt,
                endedAt
            )} total duration`;
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
                return 'No rest';
            }

            return `${minsSecDuration(average)} rest on average`;
        },
    },
};
</script>
