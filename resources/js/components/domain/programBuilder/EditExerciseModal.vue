<template>
    <VDialog
        :model-value="value"
        @update:model-value="$emit('update:value', $event)"
        max-width="600px"
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
                        <VCol cols="12" md="6" sm="6">
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
                        <VCol cols="12" md="6" sm="6">
                            <VSelect
                                :items="numberOfSetsOptions"
                                required
                                label="Number of sets"
                                variant="outlined"
                                v-model="numberOfSets"
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
import UuidHelper from '../../../UuidHelper/index';
import {
    useUpdateWorkoutProgram,
    useWorkoutProgram,
} from './composibles/programBuilderQueries';

const props = defineProps({
    value: {
        required: true,
        type: Boolean,
    },
    exerciseUuid: {
        required: true,
        type: String,
    },
    routineUuid: {
        type: String,
        default: null,
    },
    workoutProgramProp: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(['update:value']);
const { workoutProgram: workoutProgramFromQuery, getExercise } =
    useWorkoutProgram();
const { updateExercise } = useUpdateWorkoutProgram(props.routineUuid);

// Use prop if provided (session overview), otherwise use query (program builder)
const workoutProgram = computed(() => {
    if (props.workoutProgramProp) {
        return props.workoutProgramProp;
    }
    return workoutProgramFromQuery.value;
});

// Get exercise using prop pattern or query
const getExerciseData = (uuid) => {
    if (props.workoutProgramProp) {
        return UuidHelper.findDeep(
            workoutProgram.value?.workoutProgramRoutines,
            uuid,
        );
    }
    return getExercise(uuid);
};

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

const name = ref('');
const weight = ref(null);
const numberOfSets = ref(3);
const restPeriod = ref(60);
const warmUp = ref(60);

// Watch for modal opening and load current exercise data
watch(
    () => props.value,
    (isOpen) => {
        if (isOpen && props.exerciseUuid) {
            const exercise = getExerciseData(props.exerciseUuid);
            if (exercise) {
                name.value = exercise.name;
                weight.value = exercise.weight;
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
    updateExercise(workoutProgram.value.uuid, {
        uuid: props.exerciseUuid,
        name: name.value,
        weight: weight.value,
        numberOfSets: numberOfSets.value,
        restPeriod: restPeriod.value,
        warmUp: warmUp.value,
    });
};
</script>
