<template>
    <bootstrap-card title="Create new workout program">
        <form method="POST" action="">
            <div class="form-group row">
                <label for="edit-workout-program-name"
                       class="col-md-4 col-form-label text-md-right">Workout program name</label>

                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
                    <input id="edit-workout-program-name" type="text" v-bind:value="workoutProgram.name"
                           class="form-control" name="name" required>

                    <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                    <strong>{{ validationErrors.name}}</strong>
                                </span>
                </div>

                <label for="workouts-per-cycle"
                       class="col-md-4 col-form-label text-md-right">Workouts per cycle</label>

                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
                    <input id="workouts-per-cycle" type="number" min="1" step="1" class="form-control"
                           name="name" required v-bind:value="workoutsPerCycle">

                    <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                    <strong>{{ validationErrors.name}}</strong>
                                </span>
                </div>

                <workout-routine-form v-for="(workoutRoutine, index) in workoutProgram.workoutRoutines"
                                      v-bind:data="workoutRoutine" v-bind:key="index" v-bind:day="index + 1">

                </workout-routine-form>
            </div>

            <div class="form-group row mb-0">
                <div class="col-md-8 offset-md-4">
                    <button type="submit" class="btn btn-primary">
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
    import BootstrapCard from "../components/BootstrapCard";
    import WorkoutRoutineForm from "../components/domain/WorkoutRoutineForm";

    export default {
        components: {BootstrapCard, WorkoutRoutineForm},
        data() {
            return {
                validationErrors: {},
                workoutProgram: {
                    workoutRoutines: [{name: 'Push'}]
                },
            }
        },
        computed: {
            workoutsPerCycle: {
                get() {
                    return this.workoutProgram.workoutRoutines.length || '';
                },
                set(newValue) {
                    debugger;
                    newValue = Number.parseInt(newValue);

                    if (isNaN(newValue) || newValue === this.workoutsPerCycle) {
                        return;
                    }

                    let mutation = this.addWorkoutToCycle;

                    if (this.workoutsPerCycle < newValue) {
                        mutation = this.removeWorkoutFromCycle;
                    }

                    while (this.workoutsPerCycle !== newValue) {
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
            }
        }
    }
</script>
