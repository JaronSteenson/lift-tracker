<template>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">Typical exercises</h2>
            </div>

            <TypicalExerciseInput v-for="(exercise, index) in exercises"
                                  v-bind:exercise="exercise"
                                  v-bind:display-position="index"
                                  v-bind:show-cross="exercises.length > 1"
                                  v-bind:key="index"
                                  v-on:removeExercise="removeExercise"
            />

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
            },
            removeExercise(displayPosition) {
                this.$delete(this.exercises, displayPosition)
            }
        }
    }
</script>

<style scoped>
    .add-another-link {
        text-align: left;
    }
</style>
