<template>
    <VCard>
        <VCardTitle class="pb-0">{{ exercise.name }}</VCardTitle>
        <VCardText class="py-0">
            <VContainer>
                <VRow v-for="(weightGroup, index) in weightGroups" :key="index">
                    <VCol class="px-0 pt-1 pb-0">
                        <VIcon size="small">mdi-dumbbell</VIcon>
                        {{ weightGroup.weight }}: {{weightGroup.repBreakDown }}
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
                        <a href="#" @click.prevent="openStatsModal">View graphs</a>
                        <SessionExerciseStatsModal v-model="showStatsModal" :session-exercise="exercise"/>
                    </VCol>
                </VRow>
            </VContainer>
        </VCardText>
    </VCard>
</template>

<script>
    import {minsSecDuration} from '../../../filters';
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

                    const reps = weightGroup.map(set => set.reps ?? '?');
                    const repBreakDown = reps.join(', ');

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
