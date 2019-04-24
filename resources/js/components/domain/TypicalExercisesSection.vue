<template>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">Typical exercises</h2>
            </div>

            <TypicalExerciseInput v-for="(exercise, index) in exercises"
                                  @updateExercise="updateExercise"
                                  v-bind:display-position="index"
                                  v-bind:show-cross="exercises.length > 1"
                                  v-bind:key="index"
                                  v-on:removeExercise="removeExercise"
            />

            <div class="row">
                <a href="" class="add-another-link offset-md-4 col-md-4 btn btn-link" @click.prevent="addAnother()">
                    add another exercise
                </a>
            </div>
        </div>
</template>

<script>
    import TypicalExerciseInput from "./TypicalExerciseInput";

    let uuid = 0;

    export default {
        name: 'TypicalExercisesSection',
        components: {TypicalExerciseInput},
        beforeCreate() {
            this.uuid = uuid.toString();
            uuid += 1;
        },
        data() {
            return {
                exercises: [{}],
            }
        },
        computed: {
            nameInputId() {
                return `workouts-routine-name-${this.uuid}`;
            }
        },
        methods: {
            addAnother() {
                this.exercises.push({});
            },
            removeExercise(displayPosition) {
                this.$delete(this.exercises, displayPosition);
                this.$emit('input', this.exercises)
            },
            updateExercise(index, exercise) {
                this.exercises[index] = exercise;
                this.$emit('input', this.exercises)
            },
            emitInputEvent() {
                this.$emit('input', this.exercises)
            }
        }
    }
</script>

<style scoped>
    .add-another-link {
        text-align: left;
    }
</style>
