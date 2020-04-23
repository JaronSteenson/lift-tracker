<template>
    <VCard class="js-workout-drag-handle workout-builder-card" width="100%">
        <VCardTitle>
            <VTextField
                v-if="isEditingTitle"
                v-model="localState.name"
                :autofocus="isEditingTitle"
                label="Workout name"
                @blur="finishEditingTitle"
                @keydown.enter="finishEditingTitle"
                @keydown.esc="abortEditingTitle"
            >
                <template v-slot:append-outer>
                    <VBtn icon @click="abortEditingTitle" ref="abortEditingTitleButton">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </template>
            </VTextField>
            <VTextField
                v-else-if="isAddingNew"
                v-model="localState.name"
                :autofocus="isAddingNew"
                label="Workout name"
                @blur="finishAddingNew"
                @keydown.enter="finishAddingNew"
                @keydown.esc="abortAddingNew"
            >
                <template v-slot:append-outer>
                    <VBtn icon @click="abortAddingNew" ref="abortAddNewButton">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </template>
            </VTextField>
            <EditableTitle v-else @click="editTitle">{{ nameDisplay }}</EditableTitle>

            <v-menu v-if="!isAddingNew && !isEditingTitle" bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>mdi-dots-vertical</VIcon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="deleteWorkout">
                        <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VCardTitle>

        <VRow class="mt-0">
            <VCol>
                <Draggable :forceFallback="true"
                           :group="{ name: 'exercises', pull: true, put: true }"
                           dragClass="elevation-24"
                           ghostClass="drop-placeholder-exercise"
                           handle=".js-exercise-drag-handle" v-model="orderedExercises">
                    <template v-for="(exercise) in orderedExercises">
                        <ExerciseCard :exercise-uuid="exercise.uuid" :key="exercise.uuid" ref="exercise-cards"/>
                    </template>
                </Draggable>
            </VCol>
        </VRow>

        <VBtn @click="addExercise" width="100%">
            <VIcon left>mdi-plus</VIcon>
            Add exercise
        </VBtn>
    </VCard>
</template>

<script>
    import ExerciseCard from "./ExerciseCard";
    import Draggable from 'vuedraggable';
    import EditableTitle from "../../formFields/EditableTitle";

    export default {
        components: {
            EditableTitle,
            ExerciseCard,
            Draggable,
        },
        data() {
            return {
                isAddingNew: false,
                isEditingTitle: false,
                localState: { ...this.$store.getters['programBuilder/getWorkout'](this.workoutUuid) },
            }
        },
        props: {
            workoutUuid: {
                type: String,
                required: true,
            }
        },
        mounted() {
            if (this.$store.getters['programBuilder/isJustAddedModelUuid'](this.workoutUuid)) {
                this.isAddingNew = true;
                this.$nextTick(() => {
                    this.$store.dispatch('programBuilder/forgetJustAddedUuid');
                });
            }
        },
        computed: {
            workout: {
                get() {
                    return this.$store.getters['programBuilder/getWorkout'](this.workoutUuid);
                },
                set(newState) {
                    this.$store.dispatch('programBuilder/updateWorkout', { uuid: this.workoutUuid, ...newState });
                }
            },
            nameDisplay() {
                return this.localState.name || 'Unnamed workout'
            },
            orderedExercises: {
                get() {
                    return this.$store.getters['programBuilder/getOrderedExercises'](this.workoutUuid);
                },
                set(newOrderedExercises) {
                    this.$store.dispatch('programBuilder/updateExercisePositionFromOrder', {
                        workoutUuid: this.workoutUuid,
                        newOrderedExercises
                    });
                }
            }
        },
        methods: {
            editTitle() {
                this.isEditingTitle = true;
            },
            finishEditingTitle(e) {
                // Allow canceling addition of element by clicking the cancel cross.
                if (e.relatedTarget === this.$refs.abortEditingTitleButton.$el) {
                    this.abortEditingTitle();
                    return;
                }

                this.isEditingTitle = false;
                this.workout = this.localState;
            },
            abortEditingTitle() {
                this.isEditingTitle = false;
                this.localState.name = this.workout.name;
            },
            finishAddingNew(e) {
                // Allow canceling addition of element by clicking the cancel cross.
                if (e.relatedTarget === this.$refs.abortAddNewButton.$el) {
                    this.abortAddingNew();
                    return;
                }

                this.isAddingNew = false;
                this.workout = this.localState;
            },
            abortAddingNew() {
                this.deleteWorkout();
            },
            addExercise() {
                this.$store.dispatch('programBuilder/addExerciseToWorkout', { workoutUuid: this.workoutUuid });
            },
            deleteWorkout() {
                this.$store.dispatch('programBuilder/deleteWorkout', { workoutUuid: this.workoutUuid });
            },
        }
    }
</script>

<style lang="scss" scoped>
    .drop-placeholder-exercise {
        animation: blink .5s step-end infinite alternate;
    }

    .workout-drop-placeholder {
        .workout-builder-card {
            animation: blink .5s step-end infinite alternate;
        }
    }

    @keyframes blink {
        50% { border-color: var(--v-warning-base); }
    }
</style>
