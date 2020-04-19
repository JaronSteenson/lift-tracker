<template>
    <VRow justify="center">
        <v-dialog :value="value" @input="close" max-width="600px">
            <v-card>
                <v-card-title>
                    <VTextField
                        :autofocus="true"
                        @blur="isEditingTitle = false"
                        label="Exercise name"
                        v-if="isEditingTitle"
                        v-model="localState.name"
                    />
                    <EditableTitle @click="isEditingTitle = true" v-else>{{ nameDisplay }}</EditableTitle>
                    <V-btn @click="close" icon>
                        <v-icon>mdi-close</v-icon>
                    </V-btn>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <VRow>
                            <VCol cols="12" md="6" sm="6">
                                <VTextField
                                    label="Weight (kg)"
                                    type="number"
                                    v-model="localState.weight"
                                />
                            </VCol>
                            <VCol cols="12" md="6" sm="6">
                                <VSelect
                                    :items="numberOfSetsOptions"
                                    label="Number of sets"
                                    v-model="localState.numberOfSets"
                                ></VSelect>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol class="d-flex d-sm-none py-0" cols="12">
                                <VMessages :value="['Rest period (mins)']" />
                            </VCol>
                            <VCol class="d-flex d-sm-none" cols="12">
                                <VSlider
                                    class="px-0"
                                    :max="5 * 60"
                                    :min="0"
                                    step="15"
                                    thumb
                                    ticks
                                    v-model="localState.restPeriod"
                                >
                                    <template v-slot:prepend>
                                        <span>{{ localState.restPeriod | minsSecDuration }}</span>
                                    </template>
                                </VSlider>
                            </VCol>
                            <VCol class="d-none d-sm-flex" cols="12">
                                <VSlider
                                    :max="5 * 60"
                                    :min="0"
                                    label="Rest period (mins)"
                                    prepend-icon="mdi-clock"
                                    step="15"
                                    ticks
                                    v-model="localState.restPeriod"
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
