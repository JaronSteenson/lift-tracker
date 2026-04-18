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
import { computed, nextTick, ref, watch } from 'vue';
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
    hasNextPage: {
        type: Boolean,
        default: false,
    },
    isFetchingNextPage: {
        type: Boolean,
        default: false,
    },
    fetchNextPage: {
        type: Function,
        default: null,
    },
});

const route = useRoute();
const router = useRouter();
const display = useDisplay();
const PREWARM_THRESHOLD = 1;

const currentIndex = ref(props.sessionExercises.length - 1 - props.startIndex);
const selectedExerciseUuid = ref(null);
const lastPrewarmLength = ref(null);
const isOpen = computed(
    () => route.query[props.urlSearchParam] === props.urlSearchShowValue,
);

const sessionExercise = computed(
    () => props.sessionExercises[currentIndex.value],
);

const bodyWeight = computed(() => sessionExercise.value?.bodyWeight);
const hasManyExercises = computed(() => props.sessionExercises.length > 1);
const hasPrevious = computed(
    () => currentIndex.value !== 0 || props.hasNextPage,
);
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
    sessionExercise,
    (exercise) => {
        selectedExerciseUuid.value = exercise?.uuid ?? null;
    },
    { immediate: true },
);

watch(
    () => props.sessionExercises,
    (nextExercises, previousExercises = []) => {
        const previousCurrentUuid =
            previousExercises[currentIndex.value]?.uuid ??
            selectedExerciseUuid.value;

        if (!previousCurrentUuid) {
            currentIndex.value =
                props.sessionExercises.length - 1 - props.startIndex;
            return;
        }

        const nextIndex = nextExercises.findIndex(
            (exercise) => exercise.uuid === previousCurrentUuid,
        );

        if (nextIndex >= 0) {
            currentIndex.value = nextIndex;
        }
    },
);

watch(
    isOpen,
    (open) => {
        if (open) {
            void prewarmNextPage();
        }
    },
    { immediate: true },
);

watch(currentIndex, () => {
    if (isOpen.value && currentIndex.value <= PREWARM_THRESHOLD) {
        void prewarmNextPage();
    }
});

watch(
    () => route.path,
    (path, oldPath) => {
        if (path !== oldPath) {
            currentIndex.value =
                props.sessionExercises.length - 1 - props.startIndex;
        }
    },
);

async function showPrevious() {
    if (currentIndex.value !== 0) {
        currentIndex.value--;
        return;
    }

    if (props.hasNextPage && props.fetchNextPage && !props.isFetchingNextPage) {
        const currentUuid = selectedExerciseUuid.value;
        await props.fetchNextPage();
        await nextTick();

        if (!currentUuid) {
            return;
        }

        const currentExerciseIndex = props.sessionExercises.findIndex(
            (exercise) => exercise.uuid === currentUuid,
        );

        if (currentExerciseIndex > 0) {
            currentIndex.value = currentExerciseIndex - 1;
        }
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

async function prewarmNextPage() {
    if (
        !props.hasNextPage ||
        !props.fetchNextPage ||
        props.isFetchingNextPage
    ) {
        return;
    }

    const currentLength = props.sessionExercises.length;
    if (lastPrewarmLength.value === currentLength) {
        return;
    }

    lastPrewarmLength.value = currentLength;
    await props.fetchNextPage();
}
</script>

<style lang="scss" scoped>
.notes {
    white-space: pre-line;
}
</style>
