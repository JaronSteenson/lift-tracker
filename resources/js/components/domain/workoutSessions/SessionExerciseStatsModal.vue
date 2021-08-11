<template>
    <VDialog
        :fullscreen="$vuetify.breakpoint.xsOnly"
        :max-width="$vuetify.breakpoint.xsOnly ? null : '400px'"
        :value="value"
        hide-overlay
        transition="dialog-bottom-transition"
        @input="updateDialogValue"
    >
        <VCard>
            <VToolbar dark color="primary">
                <VBtn icon dark @click="close">
                    <VIcon>{{ $svgIcons.mdiClose }}</VIcon>
                </VBtn>
                <VToolbarTitle>{{ title }}</VToolbarTitle>
            </VToolbar>
            <BackForwardToolbar
                v-if="hasManyExercises"
                :enable-back="hasPrevious"
                :enable-forward="hasNext"
                @back="showPrevious"
                @forward="showNext"
            >
                {{ dateDescription }}
            </BackForwardToolbar>

            <VCardText>
                <h3 class="mt-4">Notes</h3>
                <p v-if="sessionExercise.notes">
                    {{ sessionExercise.notes }}
                </p>
                <p v-else>
                    No notes
                </p>
                <hr class="mt-2" />

                <div class="graph">
                    <h3 class="mb-2 mt-8">Weight</h3>
                    <div v-if="isSingleSet">
                        {{ singleSetWeight }} {{ singleSetReps }}
                    </div>
                    <VSparkline
                        v-else
                        :gradient="['purple', 'violet']"
                        :label-size="10"
                        :labels="weightLabels"
                        :line-width="15"
                        :radius="10"
                        :value="weights"
                        show-labels
                        smooth="radius"
                        stroke-linecap="round"
                        type="bar"
                    />
                    <hr class="mt-2" />
                </div>

                <div v-if="!isSingleSet" class="graph">
                    <h3 class="mb-2 mt-8">Reps</h3>
                    <VSparkline
                        :gradient="['purple', 'violet']"
                        :label-size="10"
                        :labels="repLabels"
                        :line-width="15"
                        :radius="10"
                        :value="reps"
                        show-labels
                        smooth="radius"
                        stroke-linecap="round"
                        type="bar"
                    />
                    <hr class="mt-2" />
                </div>

                <div class="graph" v-if="setsForRest.length > 0">
                    <h3 class="mb-2 mt-8">
                        {{
                            isSingleRestPeriod ? "Rest period" : "Rest periods"
                        }}
                    </h3>
                    <div v-if="isSingleRestPeriod">{{ singleSetRest }}</div>
                    <VSparkline
                        v-else
                        :gradient="['purple', 'violet']"
                        :label-size="10"
                        :labels="restLabels"
                        :line-width="5"
                        :padding="20"
                        :radius="5"
                        :value="rest"
                        show-labels
                        stroke-linecap="round"
                        type="trend"
                    />
                    <hr class="mt-2" />
                </div>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<script>
import { dateDescription, minsSecDuration } from '../../../dates';
import BackForwardToolbar from './../../BackForwardToolbar.vue';

export default {
    components: { BackForwardToolbar },
    props: {
        sessionExercises: {
            type: Array,
            required: true
        },
        value: {
            type: Boolean,
            required: true
        },
        startIndex: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    data() {
        return {
            currentIndex: (this.sessionExercises.length - 1) - this.startIndex,
        };
    },
    computed: {
        sessionExercise() {
            return this.sessionExercises[this.currentIndex];
        },
        hasManyExercises() {
            return this.sessionExercises.length > 1;
            s;
        },
        hasPrevious() {
            return this.currentIndex !== 0;
        },
        hasNext() {
            return this.currentIndex !== this.sessionExercises.length - 1;
        },
        title() {
            return this.sessionExercise.name;
        },
        dateDescription() {
            return dateDescription(this.sessionExercise.createdAt, true);
        },
        isSingleSet() {
            return this.sessionExercise.sessionSets.length === 1;
        },
        isSingleRestPeriod() {
            return this.setsForRest.length === 1;
        },
        singleSetWeight() {
            const weight = this.sessionExercise.sessionSets[0].weight;

            if (weight === null) {
                return "Unknown weight";
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
                    return "n/a";
                }

                return `${set.weight}kg`;
            });
        },
        singleSetReps() {
            const reps = this.sessionExercise.sessionSets[0].reps;

            if (reps === null) {
                return "";
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
                    return "n/a";
                }

                return set.reps;
            });
        },
        singleSetRest() {
            return `${minsSecDuration(
                this.sessionExercise.sessionSets[0].restPeriodDuration
            )}`;
        },
        rest() {
            return this.setsForRest.map(set => {
                if (set.restPeriodDuration === null) {
                    return 0;
                }

                return set.restPeriodDuration;
            });
        },
        restLabels() {
            return this.setsForRest.map(set => {
                if (set.restPeriodDuration === null) {
                    return "n/a";
                }

                return minsSecDuration(set.restPeriodDuration, true);
            });
        },
        setsForRest() {
            const sets = [...this.sessionExercise.sessionSets];

            // Remove the last set as we don't have a rest period for it.
            sets.pop();

            return sets;
        }
    },
    methods: {
        showPrevious() {
            if (this.hasPrevious) {
                this.currentIndex--;
            }
        },
        showNext() {
            if (this.hasNext) {
                this.currentIndex++;
            }
        },
        updateDialogValue(value) {
            if (value === false) {
                this.close();
            }
        },
        close() {
            this.$emit("input", false);
        }
    }
};
</script>
