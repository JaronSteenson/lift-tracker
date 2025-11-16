<template>
    <VDialog
        :model-value="value"
        @update:model-value="$emit('update:value', $event)"
        max-width="600px"
        :fullscreen="display.xs"
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
                <VBtn
                    size="small"
                    variant="outlined"
                    @click="$emit('update:value', false)"
                >
                    Close
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import TimerInput from '../../formFields/TimerInput.vue';
import { useWorkoutProgram } from './composibles/programBuilderQueries';

const props = defineProps({
    value: {
        required: true,
        type: Boolean,
    },
    exerciseUuid: {
        required: true,
        type: String,
    },
});

const { getExercise } = useWorkoutProgram();
const exercise = getExercise(props.exerciseUuid);

defineEmits(['update:value']);

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

const name = ref(exercise?.name);
const weight = ref(exercise?.weight);
const numberOfSets = ref(exercise?.numberOfSets);
const restPeriod = ref(exercise?.restPeriod);
const warmUp = ref(exercise?.warmUp);

watch(
    [name, weight, numberOfSets, restPeriod, warmUp],
    () => {
        if (!props.exerciseUuid) {
            return;
        }

        // programBuilderStore.updateExercise(props.exerciseUuid, {
        //     name: name.value,
        //     weight: weight.value,
        //     numberOfSets: numberOfSets.value,
        //     restPeriod: restPeriod.value,
        //     warmUp: warmUp.value,
        // });
    },
    { deep: true },
);
</script>
