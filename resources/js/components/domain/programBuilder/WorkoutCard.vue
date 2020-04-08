<template>
    <VCard class="js-workout-drag-handle drag-handle" width="100%">
        <VCardTitle>
            <VTextField
                v-model="name" :autofocus="autofocus"
                label="Workout name"
                placeholder="Enter workout name"
            />

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

    export default {
        components: {
            ExerciseCard,
            Draggable,
        },
        props: {
            workoutUuid: {
                type: String,
                required: true,
            }
        },
        computed: {
            autofocus() {
                if (this.$store.getters['programBuilder/isJustAddedModelUuid'](this.workoutUuid)) {
                    this.$nextTick(() => {
                        this.$store.dispatch('programBuilder/forgetJustAddedUuid');
                    });
                    return true;
                }
                return false;
            },
            workout: {
                get() {
                    return this.$store.getters['programBuilder/getWorkout'](this.workoutUuid);
                }
            },
            name: {
                get() {
                    return this.workout.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateWorkoutName', { uuid: this.workoutUuid, name });
                }
            },
            orderedExercises: {
                get() {
                    return this.$store.getters['programBuilder/getOrderedExercises'](this.workoutUuid);
                },
                set(orderedExercises) {
                    this.$store.dispatch('programBuilder/updateExercisePositionFromOrder', {
                        workoutUuid: this.workoutUuid,
                        orderedExercises
                    });
                }
            }
        },
        methods: {
            addExercise() {
                this.$store.dispatch('programBuilder/addExerciseToWorkout', { workoutUuid: this.workoutUuid });
            },

            deleteWorkout() {
                this.$store.dispatch('programBuilder/deleteWorkout', { workoutUuid: this.workoutUuid });
            }
        }
    }
</script>
