<template>
    <BootstrapCard class="workout-card">
        <template v-slot:header>
            <div class="js-workout-drag-handle drag-handle d-flex justify-content-center">
                <TitleInput class="workout-name" :placeholder="'Enter workout name'" v-model="name"></TitleInput>

                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a @click="deleteWorkout" class="dropdown-item" href="#">Delete</a>
                    </div>
                </div>
            </div>
        </template>

        <div class="row">
            <div class="col">
                <Draggable v-model="orderedExercises" handle=".js-exercise-drag-handle" :group="{ name: 'exercises', pull: true, put: true }"
                           :forceFallback="true" dragClass="dragging-exercise-card">
                    <template v-for="(exercise) in orderedExercises">
                        <ExerciseCard :key="exercise.cid" :exercise-cid="exercise.cid"/>
                    </template>
                </Draggable>
            </div>
        </div>

        <div class="row">
            <div class="col">
                <AddButton @click.native="addExercise">Add exercise</AddButton>
            </div>
        </div>



    </BootstrapCard>
</template>

<script>
    import TitleInput from "../../formFields/TitleInput";
    import BootstrapCard from "../../BootstrapCard";
    import AddButton from "./../../formFields/AddButton";
    import ExerciseCard from "./ExerciseCard";
    import Draggable from 'vuedraggable';

    export default {
        name: 'RoutineCard',
        components: { ExerciseCard, TitleInput, BootstrapCard, AddButton, Draggable },
        props: {
            workoutCid: {
                type: String,
                required: true,
            }
        },
        computed: {
            workout: {
                get() {
                    return this.$store.getters['programBuilder/getWorkout'](this.workoutCid);
                }
            },
            name: {
                get() {
                    return this.workout.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateWorkoutName', { cid: this.workoutCid, name });
                }
            },
            orderedExercises: {
                get: function get() {
                    return this.$store.getters['programBuilder/getOrderedExercises'](this.workoutCid);
                },
                set: function set(orderedExercises) {
                    this.$store.dispatch('programBuilder/updateExercisePositionFromOrder', { workoutCid: this.workoutCid, orderedExercises});
                }
            }
        },
        methods: {
            addExercise() {
                this.$store.dispatch('programBuilder/addExerciseToWorkout', { workoutCid: this.workoutCid });
            },

            deleteWorkout() {
                this.$store.dispatch('programBuilder/deleteWorkout', { cid: this.workoutCid });
            }
        }
    }
</script>

<style scoped>
    .workout-name {
        /* 40px for some space for the drop down menu button. */
        min-width: calc(90% - 40px);
        max-width: calc(90% - 40px);
        width: calc(90% - 40px);
        margin-right: 40px;
    }

    .dropdown {
        position: absolute;
        right: 0;
        top: 0;
    }

</style>
