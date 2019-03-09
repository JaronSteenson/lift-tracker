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

                <label for="edit-workout-program-name"
                       class="col-md-4 col-form-label text-md-right">Workouts per cycle</label>

                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
                    <input id="workouts-per-cycle" type="number" min="1" step="1" class="form-control"
                           name="name" required v-bind:value="workoutsPerCycle">

                    <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                    <strong>{{ validationErrors.name}}</strong>
                                </span>
                </div>
            </div>

            <div class="form-group row mb-0">
                <div class="col-md-8 offset-md-4">
                    <button type="submit" class="btn btn-primary">
                        Update workout program
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

    export default {
        components: {BootstrapCard},
        data() {
            return {
                validationErrors: {},
                workoutProgram: {
                    workouts: []
                },
            }
        },
        computed: {
            workoutsPerCycle: {
                get() {
                    return this.workoutProgram.workouts.length || '';
                },
                set(newValue) {
                    if (this.workoutsPerCycle < newValue) {

                    }

                    if (this.workoutsPerCycle > newValue) {

                    }
                }
            }
        },
    }
</script>
