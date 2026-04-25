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
                        <VCol
                            v-if="
                                progressionScheme ===
                                PROGRESSION_SCHEME.FIVE_THREE_ONE
                            "
                            cols="12"
                        >
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
                        <VCol
                            v-else-if="
                                progressionScheme ===
                                PROGRESSION_SCHEME.GATED_LINEAR
                            "
                            cols="12"
                        >
                            <GatedLinearProgressionSchemeSettings
                                :settings="progressionSchemeSettings"
                                @update:settings="
                                    progressionSchemeSettings = $event
                                "
                            />
                        </VCol>
                        <VCol cols="12">
                            <VDivider class="mb-4" />
                            <div class="text-body-2 text-medium-emphasis mb-3">
                                Rotation groups alternate exercises between
                                completed workouts. Only one exercise from the
                                group appears in the session each time.
                            </div>
                        </VCol>
                        <VCol cols="12" md="6">
                            <VSelect
                                v-model="selectedRotationGroupUuid"
                                :items="rotationGroupOptions"
                                label="Rotation group"
                                variant="outlined"
                            />
                        </VCol>
                        <VCol v-if="showRotationGroupOrder" cols="12" md="6">
                            <VSelect
                                v-model="rotationGroupPosition"
                                :items="rotationGroupPositionOptions"
                                label="Rotation order"
                                variant="outlined"
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
import ProgressionSchemeSettings531 from './531ProgressionSchemeSettings.vue';
import GatedLinearProgressionSchemeSettings from './GatedLinearProgressionSchemeSettings.vue';
import {
    createDraftRotationGroup,
    useExerciseCycleProjection,
    useUpdateWorkoutProgram,
    useWorkoutProgram,
    useWorkoutProgramByRoutine,
} from './composibles/programBuilderQueries';
import {
    createProgressionSchemeSettings,
    getProgressionSchemeConfig,
    progressionSchemeOptions,
    PROGRESSION_SCHEME,
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
const currentRoutine = computed(() => {
    if (!workoutProgram.value?.workoutProgramRoutines) {
        return null;
    }

    return workoutProgram.value.workoutProgramRoutines.find((routine) =>
        routine.routineExercises?.some(
            (exercise) => exercise.uuid === props.routineExerciseUuid,
        ),
    );
});

const { updateWorkoutProgram } = useUpdateWorkoutProgram(props.routineUuid);

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
const selectedRotationGroupUuid = ref(null);
const rotationGroupPosition = ref(null);
const restPeriod = ref(60);
const warmUp = ref(60);
const schemeConfig = computed(() =>
    getProgressionSchemeConfig(progressionScheme.value),
);
const hasPersistedExercise = computed(() => !!currentExercise.value?.createdAt);
const canLoadProjection = computed(
    () =>
        props.value &&
        !!props.routineExerciseUuid &&
        hasPersistedExercise.value &&
        progressionScheme.value === PROGRESSION_SCHEME.FIVE_THREE_ONE,
);
const debouncedProjectionInputs = ref(null);
const isProjectionDebouncing = ref(false);
let projectionTimeoutId = null;
const { projection, isProjectionLoading: isProjectionQueryLoading } =
    useExerciseCycleProjection({
        routineExerciseUuid: computed(() => props.routineExerciseUuid),
        progressionScheme: computed(
            () => debouncedProjectionInputs.value?.progressionScheme ?? null,
        ),
        trainingMax: computed(
            () => debouncedProjectionInputs.value?.trainingMax ?? null,
        ),
        currentCycleWeek: computed(
            () => debouncedProjectionInputs.value?.currentCycleWeek ?? null,
        ),
        bodyType: computed(
            () => debouncedProjectionInputs.value?.bodyType ?? null,
        ),
        enabled: computed(
            () =>
                canLoadProjection.value &&
                debouncedProjectionInputs.value !== null,
        ),
    });
const isProjectionLoading = computed(
    () => isProjectionDebouncing.value || isProjectionQueryLoading.value,
);
const rotationGroups = computed(
    () => currentRoutine.value?.routineExerciseRotationGroups ?? [],
);
const rotationGroupOptions = computed(() => [
    { title: 'None', value: null },
    ...rotationGroups.value.map((group, index) => ({
        title: `Rotation group ${index + 1}`,
        value: group.uuid,
    })),
    { title: 'Create new group', value: '__create__' },
]);
const showRotationGroupOrder = computed(
    () => !!selectedRotationGroupUuid.value,
);
const rotationGroupPositionOptions = computed(() => {
    if (!selectedRotationGroupUuid.value) {
        return [];
    }

    const siblingCount =
        currentRoutine.value?.routineExercises?.filter(
            (exercise) =>
                exercise.uuid !== props.routineExerciseUuid &&
                exercise.rotationGroupUuid === selectedRotationGroupUuid.value,
        )?.length ?? 0;

    return Array.from({ length: siblingCount + 1 }, (_, index) => ({
        title: `Position ${index + 1}`,
        value: index,
    }));
});

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
                    createProgressionSchemeSettings(
                        exercise.progressionScheme ?? null,
                        exercise.progressionSchemeSettings ?? null,
                    );
                selectedRotationGroupUuid.value =
                    exercise.rotationGroupUuid ?? null;
                rotationGroupPosition.value =
                    exercise.rotationGroupPosition ?? null;
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
        progressionSchemeSettings.value = createProgressionSchemeSettings(
            newProgressionScheme,
            progressionSchemeSettings.value,
        );
        return;
    }

    if (newProgressionScheme === PROGRESSION_SCHEME.GATED_LINEAR) {
        progressionSchemeSettings.value = createProgressionSchemeSettings(
            newProgressionScheme,
            progressionSchemeSettings.value,
        );
        return;
    }

    progressionSchemeSettings.value = null;
});

watch(selectedRotationGroupUuid, (newRotationGroupUuid) => {
    if (!newRotationGroupUuid) {
        rotationGroupPosition.value = null;
        return;
    }

    if (rotationGroupPosition.value === null) {
        rotationGroupPosition.value = rotationGroupPositionOptions.value.length
            ? rotationGroupPositionOptions.value.length - 1
            : 0;
    }
});

watch(
    [
        canLoadProjection,
        progressionScheme,
        weight,
        () => progressionSchemeSettings.value?.currentCycleWeek,
        () => progressionSchemeSettings.value?.bodyType,
    ],
    ([canQueryProjection]) => {
        if (projectionTimeoutId) {
            window.clearTimeout(projectionTimeoutId);
            projectionTimeoutId = null;
        }

        if (!canQueryProjection) {
            debouncedProjectionInputs.value = null;
            isProjectionDebouncing.value = false;
            return;
        }

        isProjectionDebouncing.value = true;

        projectionTimeoutId = window.setTimeout(() => {
            debouncedProjectionInputs.value = {
                progressionScheme: progressionScheme.value,
                trainingMax:
                    weight.value === null || weight.value === ''
                        ? null
                        : Number(weight.value),
                currentCycleWeek:
                    progressionSchemeSettings.value?.currentCycleWeek ?? null,
                bodyType: progressionSchemeSettings.value?.bodyType ?? null,
            };
            isProjectionDebouncing.value = false;
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

    const updatedWorkoutProgram = JSON.parse(
        JSON.stringify(workoutProgram.value),
    );
    const updatedRoutine = updatedWorkoutProgram.workoutProgramRoutines.find(
        (routine) =>
            routine.routineExercises?.some(
                (exercise) => exercise.uuid === props.routineExerciseUuid,
            ),
    );
    const updatedExercise = updatedRoutine?.routineExercises?.find(
        (exercise) => exercise.uuid === props.routineExerciseUuid,
    );

    if (!updatedRoutine || !updatedExercise) {
        return;
    }

    const hasCreateRotationGroupSelection =
        selectedRotationGroupUuid.value === '__create__';
    const previousRotationGroupUuid = updatedExercise.rotationGroupUuid ?? null;
    let persistedRotationGroupUuid = selectedRotationGroupUuid.value;

    if (hasCreateRotationGroupSelection) {
        const newRotationGroup = createDraftRotationGroup();
        updatedRoutine.routineExerciseRotationGroups = [
            ...(updatedRoutine.routineExerciseRotationGroups ?? []),
            newRotationGroup,
        ];
        persistedRotationGroupUuid = newRotationGroup.uuid;
    }

    Object.assign(updatedExercise, {
        name: name.value,
        weight: weight.value,
        rpe: rpe.value,
        numberOfSets: numberOfSets.value,
        progressionScheme: progressionScheme.value,
        progressionSchemeSettings: schemeConfig.value.showSettings
            ? progressionSchemeSettings.value
            : null,
        rotationGroupUuid: persistedRotationGroupUuid,
        rotationGroupPosition: persistedRotationGroupUuid
            ? (rotationGroupPosition.value ?? 0)
            : null,
        restPeriod: restPeriod.value,
        warmUp: warmUp.value,
    });

    normalizeRotationGroupPositions(
        updatedRoutine,
        previousRotationGroupUuid,
        props.routineExerciseUuid,
    );
    normalizeRotationGroupPositions(
        updatedRoutine,
        persistedRotationGroupUuid,
        props.routineExerciseUuid,
        updatedExercise.rotationGroupPosition ?? 0,
    );
    pruneEmptyRotationGroups(updatedRoutine);
    clampRotationGroupPointers(updatedRoutine);

    updateWorkoutProgram(workoutProgram.value.uuid, {
        workoutProgramRoutines: updatedWorkoutProgram.workoutProgramRoutines,
    });
};

function normalizeRotationGroupPositions(
    routine,
    rotationGroupUuid,
    exerciseUuid,
    desiredPosition = null,
) {
    if (!rotationGroupUuid || rotationGroupUuid === '__create__') {
        return;
    }

    const groupedExercises = routine.routineExercises
        .filter(
            (exercise) =>
                exercise.rotationGroupUuid === rotationGroupUuid &&
                exercise.uuid !== exerciseUuid,
        )
        .sort(
            (left, right) =>
                (left.rotationGroupPosition ?? 0) -
                (right.rotationGroupPosition ?? 0),
        );

    const targetExercise = routine.routineExercises.find(
        (exercise) => exercise.uuid === exerciseUuid,
    );

    if (targetExercise?.rotationGroupUuid === rotationGroupUuid) {
        const nextPosition = Math.max(
            0,
            Math.min(
                desiredPosition ?? groupedExercises.length,
                groupedExercises.length,
            ),
        );
        groupedExercises.splice(nextPosition, 0, targetExercise);
    }

    groupedExercises.forEach((exercise, index) => {
        exercise.rotationGroupPosition = index;
    });
}

function pruneEmptyRotationGroups(routine) {
    const remainingGroupUuids = new Set(
        routine.routineExercises
            .map((exercise) => exercise.rotationGroupUuid)
            .filter(Boolean),
    );

    routine.routineExerciseRotationGroups = (
        routine.routineExerciseRotationGroups ?? []
    ).filter((group) => remainingGroupUuids.has(group.uuid));
}

function clampRotationGroupPointers(routine) {
    routine.routineExerciseRotationGroups = (
        routine.routineExerciseRotationGroups ?? []
    ).map((group) => {
        const memberCount = routine.routineExercises.filter(
            (exercise) => exercise.rotationGroupUuid === group.uuid,
        ).length;

        if (memberCount === 0) {
            return group;
        }

        return {
            ...group,
            nextExerciseIndex:
                (group.nextExerciseIndex ?? 0) < 0
                    ? 0
                    : (group.nextExerciseIndex ?? 0) % memberCount,
        };
    });
}
</script>
