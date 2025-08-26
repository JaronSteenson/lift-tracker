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
                        <VCol cols="12">
                            <VTextField
                                label="Warm-up"
                                type="number"
                                :max="9999"
                                :min="0"
                                variant="outlined"
                                v-model.number="warmUp"
                            />
                        </VCol>
                        <VCol cols="12">
                            <VTextField
                                label="Rest period"
                                type="number"
                                :max="9999"
                                :min="0"
                                variant="outlined"
                                v-model.number="restPeriod"
                            />
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>
            <VCardActions>
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

<script>
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useDisplay } from 'vuetify';

export default {
    components: {},
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore };
    },
    props: {
        value: {
            required: true,
            type: Boolean,
        },
        exerciseUuid: {
            required: true,
            type: String,
        },
    },
    emits: ['update:value'],
    data() {
        const display = useDisplay();

        return {
            display,
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
        name: {
            get() {
                return this.exercise.name;
            },
            set(value) {
                this.programBuilderStore.updateExercise(this.exerciseUuid, {
                    name: value,
                });
            },
        },
        weight: {
            get() {
                return this.exercise.weight;
            },
            set(value) {
                this.programBuilderStore.updateExercise(this.exerciseUuid, {
                    weight: value,
                });
            },
        },
        numberOfSets: {
            get() {
                return this.exercise.numberOfSets;
            },
            set(value) {
                this.programBuilderStore.updateExercise(this.exerciseUuid, {
                    numberOfSets: value,
                });
            },
        },
        warmUp: {
            get() {
                return this.exercise.warmUp;
            },
            set(value) {
                this.programBuilderStore.updateExercise(this.exerciseUuid, {
                    warmUp: value || 0,
                });
            },
        },
        restPeriod: {
            get() {
                return this.exercise.restPeriod;
            },
            set(value) {
                this.programBuilderStore.updateExercise(this.exerciseUuid, {
                    restPeriod: value || 0,
                });
            },
        },
        exercise() {
            return this.programBuilderStore.getExercise(this.exerciseUuid);
        },
    },
};
</script>
