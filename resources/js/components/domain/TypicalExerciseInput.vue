<template>
    <div class="form-group row">
        <h1>EXE IMNPUT</h1>
        <label for="workouts-per-cycle"
               class="col-md-4 col-form-label text-md-right">Workouts per cycle</label>

        <div class="col-md-6">
            <input id="workouts-per-cycle" type="number" min="1" step="1" class="form-control"
                   name="name" required v-model="workoutsPerCycle">

        </div>
    </div>
</template>

<script>
    export default {
        name: 'TypicalExerciseInput',
        props: {
            exercise: {
                type: Object,
                required: false,
                default: {
                    id: null,
                    name: null,
                }
            }
        }
    }
</script>

<style scoped>

</style>