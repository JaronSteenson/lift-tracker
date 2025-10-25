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
                <template v-if="bodyWeight">
                    <h3 class="mt-1">Body weight</h3>
                    <div class="d-flex justify-space-between w-100">
                        <div>{{ bodyWeight }}kg</div>
                    </div>
                    <hr class="mt-1 mb-6" />
                </template>

                <template v-if="warmUp">
                    <h3 class="mt-1">Warm-up</h3>
                    <div class="d-flex justify-space-between w-100">
                        <div>{{ minsSecDuration(warmUp) }}</div>
                    </div>
                    <hr class="mt-1 mb-6" />
                </template>

                <h3 class="mb-1 mt-2">Weight</h3>
                <template v-if="weights.length > 1">
                    <VSparkline
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
                </template>
                <div v-else class="d-flex justify-space-between w-100">
                    <div>{{ weights[0] }}kg</div>
                </div>

                <hr class="mt-1 mb-6" />
                <h3 class="mb-1 mt-2">Reps</h3>
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
                <template v-if="rest.length >= 1">
                    <hr class="mt-1 mb-6" />
                    <h3 class="mb-1 mt-4">Rest</h3>
                    <template v-if="rest.length >= 2">
                        <VSparkline
                            :model-value="rest"
                            color="primary"
                            :line-width="2"
                            smooth
                            padding="16"
                        />
                    </template>
                    <div class="d-flex justify-space-between w-100">
                        <div :key="i" v-for="(restPeriod, i) in rest">
                            {{ minsSecDuration(restPeriod) }}
                        </div>
                    </div>
                </template>
                <hr class="mt-1 mb-6" />
                <h3 class="mb-1 mt-2">Notes</h3>
                <p v-if="sessionExercise.notes" class="notes">
                    {{ sessionExercise.notes }}
                </p>
                <MissingValue v-else>No notes</MissingValue>
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
            return this.sessionExercise.workoutSession.bodyWeight;
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
        warmUp() {
            return this.sessionExercise.warmUpDuration;
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
