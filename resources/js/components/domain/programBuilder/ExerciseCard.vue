<template>
    <VCard class="exercise-card js-exercise-drag-handle drag-handle">
        <button class="btn btn-outline-danger remove-cross" @click="removeExercise" type="button">
            <i class="fa fa-times"></i>
        </button>

        <TitleInput class="exercise-name" :placeholder="'Enter exercise name'" v-model="name"></TitleInput>
    </VCard>
</template>
<script>
    import TitleInput from "../../formFields/TitleInput"

    export default {
        name: 'ExerciseCard',
        components: { TitleInput },
        props: {
            exerciseCid: {
                type: String,
                required: true,
            }
        },
        computed: {
            exercise: {
                get() {
                    return this.$store.getters['programBuilder/getExercise'](this.exerciseCid);
                }
            },
            name: {
                get() {
                    return this.exercise.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateExercise', { exerciseCid: this.exerciseCid, name });
                }
            },
            numberOfSets: {
                get() {
                    return this.numberOr(this.exercise.numberOfSets, '');
                },
                set(numberOfSets) {
                    numberOfSets = this.numberOr(numberOfSets, null);
                    this.$store.dispatch('programBuilder/updateExercise', { exerciseCid: this.exerciseCid, numberOfSets });
                }
            },
        },
        methods: {
            getExercise() {
                return this.$store.getters['programBuilder/getExercise'](this.exerciseCid);
            },
            removeExercise() {
                return this.$store.dispatch('programBuilder/removeExercise', { exerciseCid: this.exerciseCid });
            },
            numberOr(value, fallBackValue) {
                const potentialNumber = Number.parseInt(value);

                return Number.isNaN(potentialNumber) ? fallBackValue : potentialNumber;
            },
        }
    }
</script>
<style scoped>
    .exercise-card {
        margin-bottom: 8px;
    }

    .exercise-name, .exercise-sets, .sets-cross {
        font-size: 16px;
        height: 20px;
        text-align: left;
    }

    .exercise-name {
        min-width: 80%;
        max-width: 80%;
        width: 80%;
    }

    .remove-cross {
        position: absolute;
        right: 0;
        top: 0;

        color: rgb(255, 127, 127);
        border-color: transparent;
        background-color: transparent;
    }

    .remove-cross:hover {
        color: red;
    }

</style>
