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
            <bootstrap-card>
                <title-input :key="exercise.cid" class="exercise-name" :placeholder="'Enter exercise name'" :initial-value="exercise.name" @input="updateExerciseName(exercise.cid)"></title-input>
                <br />
                <title-input :key="exercise.cid" class="exercise-sets" :placeholder="'0'" :initial-value="exercise.numberOfSets" @input="updateExerciseName(exercise.cid)"></title-input>
                <title-input disabled :key="exercise.cid" class="sets-cross" :initial-value="' sets'"></title-input>
            </bootstrap-card>
        </template>
        <add-button @click.native="addExercise">Add exercise</add-button>


    </BootstrapCard>
</template>

<script>
    import TitleInput from "../../formFields/TitleInput";
    import BootstrapCard from "../../BootstrapCard";
    import AddButton from "./../../formFields/AddButton";

    export default {
        name: "RoutineCard",
        components: { TitleInput, BootstrapCard, AddButton },
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

    .exercise-name, .exercise-sets, .sets-cross  {
        font-size: 16px;
        height: 20px;
        text-align: left;
    }

    .exercise-name {
        min-width: 40%;
        max-width: 40%;
        width: 40%;
    }

    .sets-cross {
        min-width: 10%;
        max-width: 10%;
        width: 10%;
    }

    .exercise-sets {
        min-width: 3ch;
        max-width: 3ch;
        width: 3ch;
    }


    .exercise-sets {
        margin-right: 0;
    }

    .sets-cross {
        margin-left: 0;
    }

    .input-label {
        margin: 10px;
    }
</style>
