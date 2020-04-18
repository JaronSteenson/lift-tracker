<template>
    <VCard outlined class="exercise-card js-exercise-drag-handle drag-handle">
        <VCardTitle v-if="isAddingNew">
                <VTextField
                    v-model="nameEditing" :autofocus="isAddingNew"
                    label="Exercise name"
                    @blur="isAddingNew = false"
                />
        </VCardTitle>
        <template v-else>
            <VCardTitle>
                <EditableTitle @click="showEditModal = true">{{ nameDisplay }}</EditableTitle>
                <v-menu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </VBtn>
                    </template>

                    <v-list>
                        <v-list-item @click="showEditModal = true">
                            <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteExercise">
                            <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </VCardTitle>

            <EditExerciseModal v-model="showEditModal" :exercise-uuid="exercise.uuid"></EditExerciseModal>
        </template>
    </VCard>
</template>
<script>
    import EditableTitle from "../../formFields/EditableTitle";
    import EditExerciseModal from "./EditExerciseModal";
    import exerciseMixin from "./mixins/exerciseMixin";
    export default {
        mixins: [exerciseMixin],
        components: { EditableTitle, EditExerciseModal },
        props: {
            exerciseUuid: {
                type: String,
                required: true,
            }
        },
        data() {
            return {
                isAddingNew: false,
                showEditModal: false,
            }
        },
        mounted() {
            if (this.$store.getters['programBuilder/isJustAddedModelUuid'](this.exerciseUuid)) {
                this.isAddingNew = true;

                this.$nextTick(() => {
                    this.$store.dispatch('programBuilder/forgetJustAddedUuid');
                });
            }
        },
    }
</script>

<style lang="scss" scoped>
    .exercise-card {
        margin: 2%;
    }
</style>
