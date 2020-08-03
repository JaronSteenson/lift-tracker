<template>
    <VCard>
        <VCardTitle class="pb-0">{{ exercise.name }}</VCardTitle>
        <VCardText class="py-0">
            <VContainer>
                <VRow :key="index" v-for="(weightGroup, index) in weightGroups">
                    <VCol class="px-0 pt-1 pb-0">
                        <VIcon size="small">mdi-dumbbell</VIcon>
                        {{ weightGroup.weight }}:
                        <template v-for="(repBreakDown, index) in weightGroup.repBreakDown">
                            <RouterLink
                                :key="repBreakDown.uuid"
                                :to="repBreakDown.to"
                            >{{ repBreakDown.text }}</RouterLink><template v-if="index < weightGroup.repBreakDown.length - 1">, </template>
                        </template>
                    </VCol>
                </VRow>
                <VRow>
                    <VCol class="px-0 pt-1 pb-0">
                        <VIcon size="small">mdi-clock</VIcon>
                        {{ averageRestPeriod }}
                    </VCol>
                </VRow>
                <VRow>
                    <VCol class="px-0 pt-1 pb-0">
                        <VIcon size="small">mdi-chart-line-variant</VIcon>
                        <a @click.prevent="openStatsModal" href="#">View details</a>
                        <SessionExerciseStatsModal :session-exercise="exercise" v-model="showStatsModal"/>
                    </VCol>
                </VRow>
            </VContainer>
        </VCardText>
    </VCard>
</template>

<script>
import {minsSecDuration} from '../../../dates';
import SessionExerciseStatsModal from './SessionExerciseStatsModal';

export default {
    components: {
        SessionExerciseStatsModal
    },
    props: {
        exercise: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            showStatsModal: false,
        }
    },
    computed: {
        weightGroups() {
            let weightGroups = [];

            this.exercise.sessionSets.forEach(set => {
                if (weightGroups.length === 0) {
                    weightGroups.push([set]);
                    return;
                }

                const lastWeightGroup = weightGroups[weightGroups.length - 1];
                const lastWeight = lastWeightGroup[lastWeightGroup.length - 1].weight;

                if (lastWeight === set.weight) {
                    lastWeightGroup.push(set);
                } else {
                    weightGroups.push([set]);
                }
            });

            return weightGroups.map(weightGroup => {
                const weight = weightGroup[0].weight ? `${weightGroup[0].weight}kg` : 'Unknown weight';

                const repBreakDown = weightGroup.map(set => {
                    return {
                        uuid: set.uuid,
                        text: set.reps ?? '?',
                        to: {name: 'setOverview', params: {sessionSetUuid: set.uuid}}
                    }
                });

                return {
                    weight,
                    repBreakDown,
                }
            });
        },
        averageRestPeriod() {
            const totalRest = this.exercise.sessionSets.reduce(
                (runningTotal, set) => set.restPeriodDuration + runningTotal,
                0
            )

            const average = totalRest / this.exercise.sessionSets.length;

            if (average === 0) {
                return 'No rest';
            }

            return `${minsSecDuration(average)} rest on average`;
        }
    },
    methods: {
        openStatsModal() {
            this.showStatsModal = true;
        },
    }
}
</script>

<style lang="scss" scoped>
.date-time-stat {
    @media (max-width: 600px) {
        max-width: 50%;
    }
}
</style>
