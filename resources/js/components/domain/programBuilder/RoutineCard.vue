<template>
    <BootstrapCard>
        <template v-slot:header>
            <div class="d-flex justify-content-center">
                <title-input class="workout-name" :placeholder="'Enter workout name'" :initial-value="getName()" @input="updateRoutineName"></title-input>

                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a @click="deleteWorkout" class="dropdown-item" href="#">Delete</a>
                    </div>
                </div>
            </div>
        </template>

        <template v-for="(exercise) in getExercises()">
            <ExerciseCard :key="exercise.cid" :exercise-cid="exercise.cid"/>
        </template>
        <AddButton @click.native="addExercise">Add exercise</AddButton>


    </BootstrapCard>
</template>

<script>
    import TitleInput from "../../formFields/TitleInput";
    import BootstrapCard from "../../BootstrapCard";
    import AddButton from "./../../formFields/AddButton";
    import ExerciseCard from "./ExerciseCard";

    export default {
        name: "RoutineCard",
        components: {ExerciseCard, TitleInput, BootstrapCard, AddButton },
        props: {
            workoutCid: {
                type: Number,
                required: true,
            }
        },
        methods: {
            getName() {
              return this.getWorkout().name;
            },

            hasExercises() {
                return this.getWorkout().routineExercises.length > 0;
            },

            getExercises() {
                return this.getWorkout().routineExercises;
            },

            addExercise() {
                this.$store.dispatch('programBuilder/addExerciseToWorkout', { workoutCid: this.workoutCid });
            },

            getWorkout() {
                return this.$store.getters['programBuilder/getWorkout'](this.workoutCid);
            },

            updateRoutineName(e) {
                this.$store.dispatch('programBuilder/updateWorkoutName', { cid: this.workoutCid, name:  e.target.value });
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
