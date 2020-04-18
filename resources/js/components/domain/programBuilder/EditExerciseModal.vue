<template>
    <VRow justify="center">
        <v-dialog :value="value" @input="close" max-width="600px">
            <v-card>
                <v-card-title>
                    <VTextField
                        v-if="isEditingTitle"
                        :value="editedExercise.name"
                        @input="$set(edits, 'name', $event)"
                        :autofocus="true"
                        label="Exercise name"
                        @blur="isEditingTitle = false"
                    />
                    <EditableTitle v-else @click="isEditingTitle = true">{{ editedExercise.name || nameDisplay }}</EditableTitle>
                    <V-btn icon @click="close">
                        <v-icon>mdi-close</v-icon>
                    </V-btn>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <VRow>
                            <VCol cols="12" sm="6" md="6">
                                <VTextField
                                    :value="editedExercise.weight"
                                    @input="$set(edits, 'weight', $event)"
                                    label="Weight (kg)"
                                    type="number"
                                />
                            </VCol>
                            <VCol cols="12" sm="6" md="6">
                                <VSelect
                                    :items="numberOfSetsOptions"
                                    :value="editedExercise.numberOfSets"
                                    @input="$set(edits, 'numberOfSets', $event)"
                                    label="Number of sets"
                                ></VSelect>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol cols="12">
                                <VSlider
                                    :value="editedExercise.restPeriod"
                                    @input="$set(edits, 'restPeriod', $event)"
                                    prepend-icon="mdi-clock"
                                    label="Rest period (mins)"
                                    :min="0"
                                    :max="5 * 60"
                                    step="15"
                                    ticks
                                >
                                    <template v-slot:append>
                                        <span>{{ editedExercise.restPeriod | minsSecDuration}}</span>
                                    </template>
                                </VSlider>
                            </VCol>
                        </VRow>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </VRow>
</template>

<script>
    import EditableTitle from "../../formFields/EditableTitle";
    import exerciseMixin from "./mixins/exerciseMixin";

    export default {
        mixins: [exerciseMixin],
        components: {
            EditableTitle
        },
        props: {
            value: {
                required: true,
                type: Boolean,
            },
            exerciseUuid: {
                required: true,
                type: String,
            }
        },
        data() {
            return {
                isEditingTitle: false,
                edits: {},
                numberOfSetsOptions: [
                    { text: 'One', value: 1 },
                    { text: 'Two', value: 2 },
                    { text: 'Three', value: 3 },
                    { text: 'Four', value: 4 },
                    { text: 'Five', value: 5 },
                ]
            }
        },
        computed: {
            editedExercise() {
                return { ...this.edits, ...this.exercise };
            },
            isDirty() {
                return Object.entries(this.edits).length > 0;
            }
        },
        methods: {
            close() {
                if (this.isDirty) {
                    this.exercise = this.editedExercise;
                }
                this.$emit('input', false)
            }
        },
    }
</script>
