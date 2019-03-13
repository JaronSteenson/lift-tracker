<template>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">Typical exercises</h2>
            </div>

            <TypicalExerciseInput v-for="exercise in exercises" v-bind:key="exercise.id" v-bind:exercise="exercise"/>

            <div class="row">
                <buton class="add-another-link offset-md-4 col-md-4 btn btn-link" @click="addAnother()">
                    add another exercise
                </buton>
            </div>
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
        },
        methods: {
            addAnother() {
                this.exercises.push({});
            }
        }
    }
</script>

<style scoped>
    .add-another-link {
        text-align: left;
    }
</style>
