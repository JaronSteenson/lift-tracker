<template>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">Typical exercises</h2>
            </div>

            <TypicalExerciseInput v-for="(exercise, index) in value"
                                  @updateExercise="updateExercise"
                                  @removeExercise="removeExercise"
                                  :preSelectedExercise="exercise"
                                  :display-position="index"
                                  :show-cross="value.length > 1"
                                  :key="index"
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
        props: {
            value: {
                required: false,
                default() {
                    return [{}]
                },
            }
        },
        computed: {
            nameInputId() {
                return `workouts-routine-name-${this.uuid}`;
            }
        },
        methods: {
            addAnother() {
                this.value.push({});
            },
            removeExercise(displayPosition) {
                this.$delete(this.value, displayPosition);
                this.$emit('input', this.value)
            },
            updateExercise(index, exercise) {
                this.value[index] = exercise;
                this.$emit('input', this.value)
            },
            emitInputEvent() {
                this.$emit('input', this.value)
            }
        }
    }
</script>

<style scoped>
    .add-another-link {
        text-align: left;
    }
</style>
