<template>
    <VDialog
        :fullscreen="$vuetify.breakpoint.xsOnly"
        :max-width="$vuetify.breakpoint.xsOnly ? null : '400px'"
        :value="$route.query[urlSearchParam] === urlSearchShowValue"
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
                <h3 class="mb-2 mt-4">Notes</h3>
                <p v-if="sessionExercise.notes" class="notes">
                    {{ sessionExercise.notes }}
                </p>
                <MissingValue v-else>No notes</MissingValue>

                <hr class="mt-2" />

                <div class="graph">
                    <h3 class="mb-2 mt-4">Weight</h3>
                    <template v-if="isSingleSet">
                        <p v-if="singleSetWeight !== null">
                            {{ singleSetWeight }} {{ singleSetReps }}
                        </p>
                        <MissingValue v-else>
                            Weight not recorded
                        </MissingValue>
                    </template>
                    <VSparkline
                        v-else
                        :gradient="gradient"
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
                    <h3 class="mb-2 mt-4">Reps</h3>
                    <VSparkline
                        :label-size="10"
                        :gradient="gradient"
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
                            isSingleRestPeriod ? 'Rest period' : 'Rest periods'
                        }}
                    </h3>
                    <div v-if="isSingleRestPeriod">{{ singleSetRest }}</div>
                    <VSparkline
                        v-else
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
import MissingValue from '../../util/MissingValue';

export default {
    components: { MissingValue, BackForwardToolbar },
    props: {
        urlSearchParam: {
            type: String,
            required: true,
        },
        urlSearchShowValue: {
            type: String,
            default: 'true',
        },
        sessionExercises: {
            type: Array,
            required: true,
        },
        startIndex: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    data() {
        return {
            currentIndex: this.sessionExercises.length - 1 - this.startIndex,
        };
    },
    watch: {
        $route(before, after) {
            if (before.path !== after.path) {
                this.currentIndex =
                    this.sessionExercises.length - 1 - this.startIndex;
            }
        },
    },
    computed: {
        // Bars require a gradient, or they will default to grey.
        gradient() {
            return [
                this.$vuetify.theme.themes[
                    this.$vuetify.theme.dark ? 'dark' : 'light'
                ].primary,
            ];
        },
        sessionExercise() {
            return this.sessionExercises[this.currentIndex];
        },
        hasManyExercises() {
            return this.sessionExercises.length > 1;
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
                return null;
            }

            return `${weight}kg`;
        },
        weights() {
            return this.sessionExercise.sessionSets.map((set) => {
                if (set.weight === null) {
                    return 0;
                }

                return set.weight;
            });
        },
        weightLabels() {
            return this.sessionExercise.sessionSets.map((set) => {
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
            return this.sessionExercise.sessionSets.map((set) => {
                if (set.reps === null) {
                    return 0;
                }

                return set.reps;
            });
        },
        repLabels() {
            return this.sessionExercise.sessionSets.map((set) => {
                if (set.reps === null) {
                    return 'n/a';
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
            return this.setsForRest.map((set) => {
                if (set.restPeriodDuration === null) {
                    return 0;
                }

                return set.restPeriodDuration;
            });
        },
        restLabels() {
            return this.setsForRest.map((set) => {
                if (set.restPeriodDuration === null) {
                    return 'n/a';
                }

                return minsSecDuration(set.restPeriodDuration, true);
            });
        },
        setsForRest() {
            const sets = [...this.sessionExercise.sessionSets];

            // Remove the last set as we don't have a rest period for it.
            sets.pop();

            return sets;
        },
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
            const newLocation = {
                ...this.$route,
                ...{
                    query: { [this.urlSearchParam]: undefined },
                },
            };

            this.$router.push(newLocation);
        },
    },
};
</script>

<style lang="scss" scoped>
.notes {
    white-space: pre-line;
}
</style>
