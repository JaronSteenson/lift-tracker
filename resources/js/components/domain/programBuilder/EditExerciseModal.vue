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
                                label="Weight (kg)"
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
import { ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
import TimerInput from '../../formFields/TimerInput.vue';
import {
    useUpdateWorkoutProgram,
    useWorkoutProgram,
    useWorkoutProgramByRoutine,
} from './composibles/programBuilderQueries';

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
const restPeriod = ref(60);
const warmUp = ref(60);

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
                restPeriod.value = exercise.restPeriod;
                warmUp.value = exercise.warmUp;
            }
        }
    },
    { immediate: true },
);

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
        restPeriod: restPeriod.value,
        warmUp: warmUp.value,
    });
};
</script>
