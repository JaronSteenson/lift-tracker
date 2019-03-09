<template>
    <div class="col-md-6">
        <label for="workouts-routine-form"
               class="col-md-4 col-form-label text-md-right">Workout {{day}} name</label>

            <div v-bind:class="{ 'is-invalid': validationErrors.name }"></div>
            <input id="workouts-routine-form" type="text" class="form-control"
                   name="name" required v-bind:value="workoutRoutine.name">

            <span v-if="validationErrors.name" class="invalid-feedback" role="alert">
                                        <strong>{{ validationErrors.name}}</strong>
            </span>
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