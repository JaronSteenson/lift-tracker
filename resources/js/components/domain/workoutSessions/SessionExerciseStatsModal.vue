<template>
    <VDialog :value="value"
             @input="updateDialogValue"
             :fullscreen="$vuetify.breakpoint.xsOnly"
             :max-width="$vuetify.breakpoint.xsOnly ? null : '400px'"
             hide-overlay
             transition="dialog-bottom-transition"
    >
        <VCard>
            <VToolbar flat>
                <VBtn
                    @click="close"
                    icon
                >
                    <VIcon>mdi-close</VIcon>
                </VBtn>
                <VToolbarTitle>{{ title }}</VToolbarTitle>
            </VToolbar>

            <VCardText>
                <h3>Notes</h3>
                <p v-if="sessionExercise.notes">
                    {{ sessionExercise.notes }}
                </p>
                <p v-else>
                    No notes.
                </p>

                <div class="graph">
                    <h3 class="mb-2 mt-8">Weight</h3>
                    <h2 v-if="isSingleSet">{{ singleSetWeight }} {{ singleSetReps }}</h2>
                    <VSparkline
                        v-else
                        :gradient="['purple', 'violet']"
                        :label-size="10"
                        :labels="weightLabels"
                        :line-width="15"
                        :padding="5"
                        :radius="10"
                        :value="weights"
                        auto-draw
                        stroke-linecap="round"
                        show-labels
                        type="bar"
                        smooth="radius"
                    />
                    <hr class="mt-2">
                </div>

                <div v-if="!isSingleSet" class="graph">
                    <h3 class="mb-2 mt-8">Reps</h3>
                    <VSparkline
                        :gradient="['purple', 'violet']"
                        :label-size="10"
                        :labels="repLabels"
                        :line-width="15"
                        :padding="5"
                        :radius="10"
                        :value="reps"
                        auto-draw
                        stroke-linecap="round"
                        show-labels
                        type="bar"
                        smooth="radius"
                    />
                    <hr class="mt-2">
                </div>

                <div class="graph">
                    <h3 class="mb-2 mt-8"> {{ isSingleSet ? 'Rest period' : 'Rest periods' }}</h3>
                    <h2 v-if="isSingleSet">{{ singleSetRest }}</h2>
                    <VSparkline
                        v-else
                        :gradient="['purple', 'violet']"
                        :label-size="10"
                        :labels="restLabels"
                        :line-width="5"
                        :padding="5"
                        :radius="5"
                        :value="rest"
                        auto-draw
                        stroke-linecap="round"
                        show-labels
                        type="trend"
                    />
                    <hr class="mt-2">
                </div>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<script>
    import { dateDescription, minsSecDuration } from "../../../dates";

    export default {
        props: {
            sessionExercise: {
                type: Object,
                required: true,
            },
            value: {
                type: Boolean,
                required: true,
            }
        },
        data() {
            return {}
        },
        computed: {
            title() {
                return `${this.sessionExercise.name} - ${dateDescription(this.sessionExercise.createdAt, true)}`;
            },
            isSingleSet() {
                return this.sessionExercise.sessionSets.length === 1
            },
            singleSetWeight() {
                const weight = this.sessionExercise.sessionSets[0].weight;

                if (weight === null) {
                    return 'Unknown weight';
                }

                return `${weight}kg`;
            },
            weights() {
                return this.sessionExercise.sessionSets.map(set => {
                    if (set.weight === null) {
                        return 0;
                    }

                    return set.weight;
                });
            },
            weightLabels() {
                return this.sessionExercise.sessionSets.map(set => {
                    if (set.weight === null) {
                        return 'n/a';
                    }

                    return `${set.weight}kg`;
                });
            },
            singleSetReps() {
                const reps = this.sessionExercise.sessionSets[0].reps;

                if (reps === null) {
                    return '';
                }

                return `x ${reps} reps`;
            },
            reps() {
                return this.sessionExercise.sessionSets.map(set => {
                    if (set.reps === null) {
                        return 0;
                    }

                    return set.reps;
                });
            },
            repLabels() {
                return this.sessionExercise.sessionSets.map(set => {
                    if (set.reps === null) {
                        return 'n/a';
                    }

                    return set.reps;
                });
            },
            singleSetRest() {
                return `${minsSecDuration(this.sessionExercise.sessionSets[0].restPeriodDuration)}`;
            },
            rest() {
                return this.sessionExercise.sessionSets.map(set => {
                    if (set.restPeriodDuration === null) {
                        return 0;
                    }

                    return set.restPeriodDuration;
                });
            },
            restLabels() {
                return this.sessionExercise.sessionSets.map(set => {
                    if (set.restPeriodDuration === null) {
                        return 'n/a';
                    }

                    return minsSecDuration(set.restPeriodDuration, true);
                });
            },
        },
        methods: {
            updateDialogValue(value) {
                if (value === false) {
                    this.close();
                }
            },
            close() {
                this.$emit('input', false)
            }
        }
    }
</script>

