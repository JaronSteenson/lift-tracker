<template>
    <VDialog
        :model-value="route.query[urlSearchParam] === urlSearchShowValue"
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
                {{ currentDateDescription }}
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

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { dateDescription, minsSecDuration } from '../../../dates';
import BackForwardToolbar from './../../BackForwardToolbar.vue';
import MissingValue from '../../util/MissingValue';

const props = defineProps({
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
        default: 0,
    },
});

const route = useRoute();
const router = useRouter();
const display = useDisplay();

const currentIndex = ref(props.sessionExercises.length - 1 - props.startIndex);

const sessionExercise = computed(
    () => props.sessionExercises[currentIndex.value],
);

const bodyWeight = computed(() => sessionExercise.value?.bodyWeight);
const hasManyExercises = computed(() => props.sessionExercises.length > 1);
const hasPrevious = computed(() => currentIndex.value !== 0);
const hasNext = computed(
    () => currentIndex.value !== props.sessionExercises.length - 1,
);
const currentDateDescription = computed(() =>
    dateDescription(sessionExercise.value?.createdAt, true),
);
const warmUp = computed(() => sessionExercise.value?.warmUpDuration);
const weights = computed(() =>
    sessionExercise.value.sessionSets.map((set) => set.weight || 0),
);
const reps = computed(() =>
    sessionExercise.value.sessionSets.map((set) => set.reps || 0),
);
const setsForRest = computed(() => {
    const sets = [...sessionExercise.value.sessionSets];
    sets.pop();
    return sets;
});
const rest = computed(() =>
    setsForRest.value.map((set) => set.restPeriodDuration || 0),
);

watch(
    () => route.path,
    (path, oldPath) => {
        if (path !== oldPath) {
            currentIndex.value =
                props.sessionExercises.length - 1 - props.startIndex;
        }
    },
);

function showPrevious() {
    if (hasPrevious.value) {
        currentIndex.value--;
    }
}

function showNext() {
    if (hasNext.value) {
        currentIndex.value++;
    }
}

function updateDialogValue(value) {
    if (value === false) {
        close();
    }
}

function close() {
    router.push({
        ...route,
        query: {
            ...route.query,
            [props.urlSearchParam]: undefined,
        },
    });
}
</script>

<style lang="scss" scoped>
.notes {
    white-space: pre-line;
}
</style>
