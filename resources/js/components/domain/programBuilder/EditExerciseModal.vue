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
        const exercise = this.exerciseUuid
            ? null
            : this.programBuilderStore.getExercise(this.exerciseUuid);

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
            name: exercise?.name,
            weight: exercise?.weight,
            numberOfSets: exercise?.numberOfSets,
            restPeriod: exercise?.restPeriod,
            warmUp: exercise?.warmUp,
        };
    },
    watch: {
        value() {
            if (!this.exerciseUuid) {
                return;
            }

            const exercise = this.programBuilderStore.getExercise(
                this.exerciseUuid,
            );

            this.name = exercise?.name;
            this.weight = exercise?.weight;
            this.numberOfSets = exercise?.numberOfSets;
            this.restPeriod = exercise?.restPeriod;
            this.warmUp = exercise?.warmUp;
        },
        $data: {
            handler() {
                if (!this.exerciseUuid) {
                    return;
                }

                this.programBuilderStore.updateExercise(this.exerciseUuid, {
                    name: this.name,
                    weight: this.weight,
                    numberOfSets: this.numberOfSets,
                    restPeriod: this.restPeriod,
                    warmUp: this.warmUp,
                });
            },
            deep: true,
        },
    },
};
</script>
