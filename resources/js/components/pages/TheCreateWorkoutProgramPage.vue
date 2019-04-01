<template>
    <bootstrap-card title="Create new workout program">
        <form @submit.prevent>
            <div class="form-group row">
                <label for="edit-workout-program-name"
                       class="col-md-4 col-form-label text-md-right">Program name</label>

                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
                    <input id="edit-workout-program-name" type="text" v-model="workoutProgram.name"
                           class="form-control" name="name" required>

                    <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                    <strong>{{ validationErrors.name}}</strong>
                    </span>
                </div>

            </div>

            <div class="form-group row">
                <label for="workouts-per-cycle"
                       class="col-md-4 col-form-label text-md-right">Workouts per cycle</label>

                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
                    <input id="workouts-per-cycle" type="number" min="1" step="1" class="form-control"
                           name="name" required v-model="workoutsPerCycle">

                    <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                    <strong>{{ validationErrors.name}}</strong>
                                </span>
                </div>
            </div>

            <hr v-if="hasWorkoutRoutines()" class="form-section-divider">

            <workout-routine-form v-for="(workoutRoutine, index) in workoutProgram.workoutRoutines"
                                  v-bind:workoutRoutine="workoutRoutine" v-bind:key="index" v-bind:day="index + 1">

            </workout-routine-form>


            <div class="form-group row mb-0">
                <div class="col-md-8 offset-md-4">
                    <button type="submit" class="btn btn-primary"  @click="save" v-bind:class="{ disabled: hasNoWorkoutRoutines() }">
                        save
                    </button>

                    <a class="btn btn-link" href="/workout-programs">
                        cancel
                    </a>
                </div>
            </div>

        </form>
    </bootstrap-card>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutRoutineForm from "../domain/WorkoutRoutineForm";
    import axios from "axios";

    export default {
        name: 'TheCreateWorkoutProgramPage',
        components: {BootstrapCard, WorkoutRoutineForm},
        data() {
            return {
                validationErrors: {},
                workoutProgram: {
                    name: '',
                    workoutRoutines: [{}]
                },
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
                        mutation();
                    }
                }
            }
        },
        methods: {
            addWorkoutToCycle() {
                this.workoutProgram.workoutRoutines.push({});
            },
            removeWorkoutFromCycle() {
                this.workoutProgram.workoutRoutines.pop();
            },
            getWorkoutRoutineLength() {
                return this.workoutProgram.workoutRoutines.length;
            },
            hasWorkoutRoutines() {
                return this.getWorkoutRoutineLength() > 0;
            },
            hasNoWorkoutRoutines() {
                return !this.hasWorkoutRoutines();
            },

            async save() {
                const response = await axios.post('/api/workout-programs/', this.workoutProgram);

                debugger;
                this.workoutProgram = response.data
            },
        }
    }
</script>
