<template>
    <div class="form-group">
        <div class="row">
            <h2 class="col-md-4 col-form-label text-md-right">{{ workoutRoutine.name }}</h2>
        </div>

        <div class="row">
            <label for="workouts-routine-form"
                   class="col-md-4 col-form-label text-md-right">Workout name</label>
            <div class="col-md-6">
                <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
                <input id="workouts-routine-form" type="text" class="form-control"
                       name="name" required v-model="workoutRoutine.name">

                <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                        <strong>{{ validationErrors.name}}</strong>
            </span>
            </div>
        </div>
        <hr class="form-section-divider">
    </div>
</template>

<script>
    export default {
        name: "WorkoutRoutineForm",
        props: ['day', 'data'],
        data() {
            return {
                validationErrors: {},
                workoutRoutine: {
                    name: `Workout ${this.day}`
                }
            }
        },
        computed: {}
    }
</script>
