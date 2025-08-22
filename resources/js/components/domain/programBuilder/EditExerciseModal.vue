<template>
    <VRow justify="center">
        <VDialog
            :model-value="modelValue"
            @update:model-value="close"
            max-width="600px"
        >
            <VCard>
                <VCardText>
                    <VContainer>
                        <VRow>
                            <VCol cols="12">
                                <VTextField
                                    v-model="localState.name"
                                    label="Exercise name"
                                    variant="outlined"
                                    autofocus
                                    @blur="finishEditingName"
                                    @keydown.enter="finishEditingName"
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
                                    v-model="localState.weight"
                                />
                            </VCol>
                            <VCol cols="12" md="6" sm="6">
                                <VSelect
                                    :items="numberOfSetsOptions"
                                    label="Number of sets"
                                    variant="outlined"
                                    v-model="localState.numberOfSets"
                                ></VSelect>
                            </VCol>
                            <VCol cols="12">
                                <RestPeriodSlider
                                    label="Warm-up"
                                    v-model="localState.warmUp"
                                />
                            </VCol>
                            <VCol cols="12">
                                <RestPeriodSlider
                                    label="Rest period"
                                    v-model="localState.restPeriodInSeconds"
                                />
                            </VCol>
                        </VRow>
                    </VContainer>
                </VCardText>
            </VCard>
        </VDialog>
    </VRow>
</template>

<script>
import RestPeriodSlider from '../RestPeriodSlider';
import { useProgramBuilderStore } from '../../../stores/programBuilder';

export default {
    components: {
        RestPeriodSlider,
    },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore };
    },
    props: {
        modelValue: {
            required: true,
            type: Boolean,
        },
        exerciseUuid: {
            required: true,
            type: String,
        },
    },
    data() {
        return {
            localState: {
                ...this.programBuilderStore.getExercise(this.exerciseUuid),
            },
            numberOfSetsOptions: [
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
            ],
        };
    },
    computed: {
        exercise: {
            get() {
                return this.programBuilderStore.getExercise(this.exerciseUuid);
            },
            set(newState) {
                this.programBuilderStore.updateExercise({
                    exerciseUuid: this.exerciseUuid,
                    ...newState,
                });
            },
        },
        isDirty() {
            return Object.entries(this.localState).some((entry) => {
                const entryKey = entry[0];
                return this.localState[entryKey] !== this.exercise[entryKey];
            });
        },
        nameDisplay() {
            return this.localState.name || 'Unnamed exercise';
        },
    },
    methods: {
        finishEditingName() {
            this.exercise = this.localState;
        },
        close() {
            if (this.isDirty) {
                this.exercise = this.localState;
            }
            this.$emit('update:modelValue', false);
        },
    },
};
</script>
