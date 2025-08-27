<template>
    <VDialog
        :model-value="$route.query[urlSearchParam] === urlSearchShowValue"
        @update:model-value="updateDialogValue"
        max-width="600px"
        :fullscreen="display.xs.value"
        hide-overlay
        transition="dialog-bottom-transition"
    >
        <VCard>
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

                <template v-if="bodyWeight">
                    <h3 class="mt-2">Body weight</h3>
                    <div class="d-flex justify-space-between w-100">
                        <div>{{ bodyWeight }}kg</div>
                    </div>
                    <hr />
                </template>

                <h3 class="mb-2 mt-4">Weight</h3>
                <VSparkline
                    v-if="weights.length > 1"
                    :model-value="weights"
                    color="primary"
                    :line-width="2"
                    smooth
                    padding="16"
                />
                <div class="d-flex justify-space-between w-100">
                    <div :key="i" v-for="(weight, i) in weights">
                        {{ weight }}kg
                    </div>
                </div>
                <hr class="mt-2" />

                <h3 class="mb-2 mt-4">Reps</h3>
                <VSparkline
                    v-if="reps.length > 1"
                    :model-value="reps"
                    color="primary"
                    :line-width="2"
                    smooth
                    padding="16"
                />
                <div class="d-flex justify-space-between w-100">
                    <div :key="i" v-for="(repCount, i) in reps">
                        {{ repCount }}
                    </div>
                </div>
                <hr class="mt-2" />

                <h3 class="mb-2 mt-8">Rest</h3>
                <VSparkline
                    v-if="rest.length > 1"
                    :model-value="rest"
                    color="primary"
                    :line-width="2"
                    smooth
                    padding="16"
                />
                <div class="text-primary text-h3 text-center" v-else>{{}}</div>
                <div class="d-flex justify-space-between w-100">
                    <div :key="i" v-for="(restPeriod, i) in rest">
                        {{ minsSecDuration(restPeriod) }}
                    </div>
                </div>
                <hr class="mt-2" />
            </VCardText>
            <VCardActions class="justify-center">
                <VBtn size="small" variant="outlined" @click="close">
                    Close
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script>
import { dateDescription, minsSecDuration } from '../../../dates';
import BackForwardToolbar from './../../BackForwardToolbar.vue';
import MissingValue from '../../util/MissingValue';
import { useDisplay } from 'vuetify';

export default {
    components: { MissingValue, BackForwardToolbar },
    setup() {
        const display = useDisplay();
        return { display, minsSecDuration };
    },
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
        bodyWeight() {
            return (
                this.sessionExercise &&
                this.sessionExercise.workoutSession &&
                this.sessionExercise.workoutSession.bodyWeight
            );
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
        weights() {
            return this.sessionExercise.sessionSets.map((set) => {
                return set.weight || 0;
            });
        },
        reps() {
            return this.sessionExercise.sessionSets.map((set) => {
                return set.reps || 0;
            });
        },
        rest() {
            return this.setsForRest.map((set) => {
                return set.restPeriodDuration || 0;
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
