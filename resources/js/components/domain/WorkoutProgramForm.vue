<template>
    <form @submit.prevent>
        <div class="form-group row">
            <label for="edit-workout-program-name"
                   class="col-md-4 col-form-label text-md-right">Program name</label>

            <div class="col-md-6">
                <div v-bind:class="{ 'is-invalid': false }"></div>
                <input id="edit-workout-program-name" type="text" v-model="workoutProgram.name"
                       class="form-control" name="name" required>

                <span v-if="false" class="invalid-feedback" role="alert">
                                    <strong></strong>
                    </span>
            </div>

        </div>

        <div class="form-group row">
            <label for="workouts-per-cycle"
                   class="col-md-4 col-form-label text-md-right">Workouts per cycle</label>

            <div class="col-md-6">
                <div v-bind:class="{ 'is-invalid': false}"></div>
                <input id="workouts-per-cycle" type="number" min="1" step="1" class="form-control"
                       name="name" required v-model="workoutsPerCycle">

                <span v-if="false" class="invalid-feedback" role="alert">
                                    <strong></strong>
                                </span>
            </div>
        </div>

        <hr v-if="hasWorkoutRoutines()" class="form-section-divider">

        <WorkoutRoutineForm v-for="(workoutRoutine, index) in workoutProgram.workoutProgramRoutines"
                            :workoutRoutine="workoutProgram.workoutProgramRoutines[index]" v-bind:key="index">
        </WorkoutRoutineForm>


        <div class="form-group row mb-0">
            <div class="col-md-8 offset-md-4">
                <button type="submit" class="btn btn-primary"  @click="saveWorkoutProgram" v-bind:class="{ disabled: hasNoWorkoutRoutines() }">
                    save
                </button>

                <router-link class="btn btn-link"  tag="a" to="/workout-programs">
                    Cancel
                </router-link>
            </div>
        </div>

    </form>
</template>

<script>
    import WorkoutRoutineForm from "../domain/WorkoutRoutineForm";
    import WorkoutProgramService from "../../services/WorkoutProgramService";

    export default {
        name: 'WorkoutProgramForm',
        components: {WorkoutRoutineForm},
        props: {
            workoutProgram: {
                default() {
                    return {
                        name: '',
                        workoutProgramRoutines: [{
                            name: null,
                            normalDay: 'any',
                            routineExercises: [{}],
                        }],
                    };
                }
            }
        },
        computed: {
            workoutsPerCycle: {
                get() {
                    return this.getWorkoutRoutineLength() || '';
                },
                set(newValue) {
                    newValue = Number.parseInt(newValue);
                    const workoutsPerCycle = this.getWorkoutRoutineLength();

                    if (isNaN(newValue) || newValue === workoutsPerCycle || newValue < 0 || newValue > 20) {
                        return;
                    }

                    let mutation = this.addWorkoutToCycle;

                    if (workoutsPerCycle > newValue) {
                        mutation = this.removeWorkoutFromCycle;
                    }

                    while (this.getWorkoutRoutineLength() !== newValue) {
                        mutation.call(this);
                    }
                }
            }
        },
        methods: {
            addWorkoutToCycle() {
                this.workoutProgram.workoutProgramRoutines.push({});
            },
            removeWorkoutFromCycle() {
                this.workoutProgram.workoutProgramRoutines.pop();
            },
            getWorkoutRoutineLength() {
                return this.workoutProgram.workoutProgramRoutines.length;
            },
            hasWorkoutRoutines() {
                return this.getWorkoutRoutineLength() > 0;
            },
            hasNoWorkoutRoutines() {
                return !this.hasWorkoutRoutines();
            },

            async saveWorkoutProgram() {
                await WorkoutProgramService.save(this.workoutProgram);
            },
        }
    }
</script>
