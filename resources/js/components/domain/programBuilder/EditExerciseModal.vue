<template>
    <VDialog
        :model-value="value"
        @update:model-value="$emit('update:value', $event)"
        max-width="720px"
        :fullscreen="display.xs.value"
    >
        <VCard>
            <VCardText>
                <VContainer>
                    <VRow>
                        <VCol cols="12">
                            <VTextField
                                v-model="name"
                                label="Exercise name"
                                variant="outlined"
                                autofocus
                            />
                        </VCol>
                        <VCol cols="12" md="4" sm="4">
                            <VTextField
                                :label="`${schemeConfig.weightLabel} (kg)`"
                                type="number"
                                :step="2.5"
                                :max="9999"
                                :min="0"
                                variant="outlined"
                                v-model="weight"
                            />
                        </VCol>
                        <VCol cols="12" md="4" sm="4">
                            <VSelect
                                :items="numberOfSetsOptions"
                                required
                                label="Number of sets"
                                variant="outlined"
                                :disabled="schemeConfig.lockReps"
                                v-model="numberOfSets"
                            />
                        </VCol>
                        <VCol cols="12" md="4" sm="4">
                            <VSelect
                                v-model="rpe"
                                :items="rpeOptions"
                                label="RPE"
                                variant="outlined"
                            />
                        </VCol>
                        <VCol cols="6">
                            <TimerInput label="Warm-up" v-model="warmUp" />
                        </VCol>
                        <VCol cols="6">
                            <TimerInput
                                label="Rest period"
                                v-model="restPeriod"
                            />
                        </VCol>
                        <VCol cols="12" md="6">
                            <VSelect
                                v-model="progressionScheme"
                                :items="progressionSchemeOptions"
                                label="Progression scheme"
                                variant="outlined"
                            />
                        </VCol>
                        <VCol v-if="schemeConfig.showSettings" cols="12">
                            <ProgressionSchemeSettings531
                                :settings="progressionSchemeSettings"
                                :projection="projection"
                                :is-projection-loading="isProjectionLoading"
                                :has-persisted-exercise="hasPersistedExercise"
                                @update:settings="
                                    progressionSchemeSettings = $event
                                "
                            />
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>
            <VCardActions class="justify-center">
                <VBtn size="small" variant="outlined" @click="closeModal">
                    Close
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { useDisplay } from 'vuetify';
import TimerInput from '../../formFields/TimerInput.vue';
import SessionExerciseService from '../../../api/SessionExerciseService';
import ProgressionSchemeSettings531 from './531ProgressionSchemeSettings.vue';
import {
    useUpdateWorkoutProgram,
    useWorkoutProgram,
    useWorkoutProgramByRoutine,
} from './composibles/programBuilderQueries';
import {
    getProgressionSchemeConfig,
    progressionSchemeOptions,
    PROGRESSION_SCHEME,
    PROGRESSION_SCHEME_531_BODY_TYPE,
} from './progressionSchemeRegistry';

const props = defineProps({
    value: {
        required: true,
        type: Boolean,
    },
    routineExerciseUuid: {
        required: true,
        type: String,
    },
    routineUuid: {
        type: String,
        default: null,
    },
    workoutProgramUuid: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['update:value']);
const directWorkoutProgramUuid = computed(() => props.workoutProgramUuid);
const routineLookupUuid = computed(() =>
    props.workoutProgramUuid ? null : props.routineUuid,
);
const directWorkoutProgramQuery = useWorkoutProgram(directWorkoutProgramUuid);
const routineWorkoutProgramQuery =
    useWorkoutProgramByRoutine(routineLookupUuid);
const workoutProgram = computed(() =>
    directWorkoutProgramUuid.value
        ? directWorkoutProgramQuery.workoutProgram.value
        : routineWorkoutProgramQuery.workoutProgram.value,
);
const getExercise = (uuid) => {
    if (directWorkoutProgramUuid.value) {
        return directWorkoutProgramQuery.getExercise(uuid);
    }

    return routineWorkoutProgramQuery.getExercise.value(uuid);
};
const currentExercise = computed(() =>
    props.routineExerciseUuid ? getExercise(props.routineExerciseUuid) : null,
);

const { updateExercise } = useUpdateWorkoutProgram(props.routineUuid);

const display = useDisplay();

const numberOfSetsOptions = [
    { title: 'One', value: 1 },
    { title: 'Two', value: 2 },
    { title: 'Three', value: 3 },
    { title: 'Four', value: 4 },
    { title: 'Five', value: 5 },
    { title: 'Six', value: 6 },
    { title: 'Seven', value: 7 },
    { title: 'Eight', value: 8 },
    { title: 'Nine', value: 9 },
    { title: 'Ten', value: 10 },
];
const rpeOptions = [
    { title: 'N/A', value: null },
    ...Array.from({ length: 10 }, (_, index) => ({
        title: String(index + 1),
        value: index + 1,
    })),
];

const name = ref('');
const weight = ref(null);
const rpe = ref(null);
const numberOfSets = ref(3);
const progressionScheme = ref(null);
const progressionSchemeSettings = ref(null);
const restPeriod = ref(60);
const warmUp = ref(60);
const projection = ref(null);
const isProjectionLoading = ref(false);
const schemeConfig = computed(() =>
    getProgressionSchemeConfig(progressionScheme.value),
);
const hasPersistedExercise = computed(() => !!currentExercise.value?.createdAt);
let projectionTimeoutId = null;
let latestProjectionRequestId = 0;

// Watch for modal opening and load current exercise data
watch(
    [() => props.value, workoutProgram],
    ([isOpen]) => {
        if (isOpen && props.routineExerciseUuid) {
            const exercise = getExercise(props.routineExerciseUuid);
            if (exercise) {
                name.value = exercise.name;
                weight.value = exercise.weight;
                rpe.value = exercise.rpe;
                numberOfSets.value = exercise.numberOfSets;
                progressionScheme.value = exercise.progressionScheme ?? null;
                progressionSchemeSettings.value =
                    exercise.progressionSchemeSettings ?? null;
                restPeriod.value = exercise.restPeriod;
                warmUp.value = exercise.warmUp;
            }
        }
    },
    { immediate: true },
);

watch(progressionScheme, (newProgressionScheme) => {
    if (newProgressionScheme === PROGRESSION_SCHEME.FIVE_THREE_ONE) {
        numberOfSets.value = 3;
        progressionSchemeSettings.value = progressionSchemeSettings.value || {
            currentCycleWeek: 1,
            bodyType: PROGRESSION_SCHEME_531_BODY_TYPE.UPPER,
        };
        return;
    }

    projection.value = null;
    progressionSchemeSettings.value = null;
});

watch(
    [
        () => props.value,
        progressionScheme,
        weight,
        () => progressionSchemeSettings.value?.currentCycleWeek,
        () => progressionSchemeSettings.value?.bodyType,
        hasPersistedExercise,
    ],
    ([isOpen, activeProgressionScheme]) => {
        if (projectionTimeoutId) {
            window.clearTimeout(projectionTimeoutId);
            projectionTimeoutId = null;
        }

        if (
            !isOpen ||
            activeProgressionScheme !== PROGRESSION_SCHEME.FIVE_THREE_ONE
        ) {
            projection.value = null;
            isProjectionLoading.value = false;
            return;
        }

        if (!hasPersistedExercise.value) {
            projection.value = null;
            isProjectionLoading.value = false;
            return;
        }

        projectionTimeoutId = window.setTimeout(async () => {
            const requestId = latestProjectionRequestId + 1;
            latestProjectionRequestId = requestId;
            isProjectionLoading.value = true;

            try {
                const response =
                    await SessionExerciseService.getCycleProjection(
                        props.routineExerciseUuid,
                        {
                            trainingMax:
                                weight.value === null || weight.value === ''
                                    ? null
                                    : Number(weight.value),
                            currentCycleWeek:
                                progressionSchemeSettings.value
                                    ?.currentCycleWeek ?? null,
                            bodyType:
                                progressionSchemeSettings.value?.bodyType ??
                                null,
                        },
                    );

                if (requestId === latestProjectionRequestId) {
                    projection.value = response.data;
                }
            } catch (error) {
                if (requestId === latestProjectionRequestId) {
                    projection.value = null;
                }
            } finally {
                if (requestId === latestProjectionRequestId) {
                    isProjectionLoading.value = false;
                }
            }
        }, 300);
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (projectionTimeoutId) {
        window.clearTimeout(projectionTimeoutId);
    }
});

const closeModal = () => {
    emit('update:value', false);
    if (!workoutProgram.value?.uuid) {
        return;
    }

    updateExercise(workoutProgram.value.uuid, {
        uuid: props.routineExerciseUuid,
        name: name.value,
        weight: weight.value,
        rpe: rpe.value,
        numberOfSets: numberOfSets.value,
        progressionScheme: progressionScheme.value,
        progressionSchemeSettings:
            progressionScheme.value === PROGRESSION_SCHEME.FIVE_THREE_ONE
                ? progressionSchemeSettings.value
                : null,
        restPeriod: restPeriod.value,
        warmUp: warmUp.value,
    });
};
</script>
