<template>
    <VRow justify="center">
        <v-dialog :value="value" @input="close" max-width="600px">
            <v-card>
                <v-card-title>
                    <VTextField
                        v-if="isEditingTitle"
                        v-model="localState.name"
                        :autofocus="true"
                        label="Exercise name"
                        @blur="isEditingTitle = false"
                    />
                    <EditableTitle v-else @click="isEditingTitle = true">{{ nameDisplay }}</EditableTitle>
                    <V-btn icon @click="close">
                        <v-icon>mdi-close</v-icon>
                    </V-btn>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <VRow>
                            <VCol cols="12" sm="6" md="6">
                                <VTextField
                                    v-model="localState.weight"
                                    label="Weight (kg)"
                                    type="number"
                                />
                            </VCol>
                            <VCol cols="12" sm="6" md="6">
                                <VSelect
                                    :items="numberOfSetsOptions"
                                    v-model="localState.numberOfSets"
                                    label="Number of sets"
                                ></VSelect>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol cols="12">
                                <VSlider
                                    v-model="localState.restPeriod"
                                    prepend-icon="mdi-clock"
                                    label="Rest period (mins)"
                                    :min="0"
                                    :max="5 * 60"
                                    step="15"
                                    ticks
                                >
                                    <template v-slot:append>
                                        <span>{{ localState.restPeriod | minsSecDuration }}</span>
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
        methods: {
            close() {
                if (this.isDirty) {
                    this.exercise = this.localState;
                }
                this.$emit('input', false)
            }
        },
    }
</script>
