<template>
    <VRow justify="center">
        <v-dialog :value="value" @input="close" max-width="600px">
            <v-card>
                <v-card-title>
                    <VTextField
                        v-if="isEditingTitle"
                        v-model="editedExercise.name"
                        :autofocus="true"
                        label="Exercise name"
                        @blur="isEditingTitle = false"
                    />
                    <EditableTitle v-else @click="isEditingTitle = true">{{ editedExercise.name || nameDisplay }}</EditableTitle>
                    <V-btn icon @click="$emit('input', false)">
                        <v-icon>mdi-close</v-icon>
                    </V-btn>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <VRow>
                            <VCol cols="12" sm="6" md="6">
                                <VTextField
                                    label="Weight (kg)"
                                    type="number"
                                />
                            </VCol>
                            <VCol cols="12" sm="6" md="6">
                                <VSelect
                                    :items="numberOfSetsOptions"
                                    v-model="editedExercise.numberOfSets"
                                    label="Number of sets"
                                ></VSelect>
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
                exerciseUpdates: {},
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
                return { ...this.exercise };
            },
        },
        methods: {
            close() {
                this.exercise = this.editedExercise;
                this.$emit('input', false)
            }
        }
    }
</script>
