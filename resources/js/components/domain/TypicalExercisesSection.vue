<template>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">Typical exercises</h2>
            </div>

            <TypicalExerciseInput v-for="exercise in exercises" v-bind:exercise="exercise"/>
        </div>
</template>

<script>
    import TypicalExerciseInput from "./TypicalExerciseInput";

    export default {
        name: 'TypicalExercisesSection',
        components: {TypicalExerciseInput},
        props: {
            exercises: {
                type: Array,
                required: false,
                default: [{}],
            }
        },
        data() {
            return {

            }
        },
        computed: {
            nameInputId() {
                return `workouts-routine-name-${this.$vnode.key}`;
            }
        }
    }
</script>
