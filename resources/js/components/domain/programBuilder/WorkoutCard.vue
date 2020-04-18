<template>
    <VCard class="js-workout-drag-handle drag-handle" width="100%">
        <VCardTitle>
            <VTextField
                v-if="isEditingTitle"
                v-model="nameEditing" :autofocus="isEditingTitle"
                label="Workout name"
                @blur="stopEditingTitle"
            />
            <EditableTitle v-else @click="editTitle">{{ nameDisplay }}</EditableTitle>

            <v-menu bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn
                        icon
                        v-on="on"
                    >
                        <v-icon>mdi-dots-vertical</v-icon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="deleteWorkout">
                        <v-list-item-title>Delete this workout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VCardTitle>

        <div class="row">
            <div class="col">
                <Draggable :forceFallback="true" :group="{ name: 'exercises', pull: true, put: true }"
                           dragClass="dragging-exercise-card"
                           handle=".js-exercise-drag-handle" v-model="orderedExercises">
                    <template v-for="(exercise) in orderedExercises">
                        <ExerciseCard :exercise-uuid="exercise.uuid" :key="exercise.uuid" ref="exercise-cards"/>
                    </template>
                </Draggable>
            </div>
        </div>

        <VBtn @click="addExercise" width="100%">
            <v-icon left>mdi-plus</v-icon>
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
                isEditingTitle: false,
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
                this.isEditingTitle = true;
                this.$nextTick(() => {
                    this.$store.dispatch('programBuilder/forgetJustAddedUuid');
                });
            }
        },
        computed: {
            workout: {
                get() {
                    return this.$store.getters['programBuilder/getWorkout'](this.workoutUuid);
                }
            },
            nameEditing: {
                get() {
                    return this.workout.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateWorkoutName', { uuid: this.workoutUuid, name });
                }
            },
            nameDisplay() {
                return this.$store.getters['programBuilder/getWorkoutNameForDisplay'](this.workoutUuid);
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
                this.forceTitleFocus = true;
            },

            stopEditingTitle() {
                this.isEditingTitle = false;
                this.forceTitleFocus = false;
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
