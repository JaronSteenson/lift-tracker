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
                    <EditableTitle @click="isEditingTitle = true" v-else>{{
                        nameDisplay
                    }}</EditableTitle>
                    <V-btn @click="close" icon>
                        <v-icon>{{ $svgIcons.mdiClose }}</v-icon>
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
                            <VCol cols="12">
                                <RestPeriodSlider
                                    v-model="localState.restPeriod"
                                />
                            </VCol>
                        </VRow>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </VRow>
</template>

<script>
import EditableTitle from '../../formFields/EditableTitle';
import exerciseMixin from './mixins/exerciseMixin';
import RestPeriodSlider from '../RestPeriodSlider';

export default {
    mixins: [exerciseMixin],
    components: {
        RestPeriodSlider,
        EditableTitle,
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
    methods: {
        close() {
            if (this.isDirty) {
                this.exercise = this.localState;
            }
            this.$emit('input', false);
        },
    },
};
</script>
