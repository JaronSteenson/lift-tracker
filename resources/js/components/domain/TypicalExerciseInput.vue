<template>
    <div class="draggable-section">
        <CloseCross v-if="showCross" @click.native="$emit('removeExercise', displayPosition)"/>

        <div class="form-group row">
            <label v-bind:for="nameInputId"
                   class="col-md-4 col-form-label text-md-right">Exercise</label>
            <div class="col-md-6">
                <select v-bind:id="nameInputId" class="form-control" @input="updateExercise($event.target.value)">
                    <option :value="null"></option>
                    <option v-for="exercise in getAvailableExercises()" v-bind:key="exercise.id" v-bind:value="exercise.id" :value="numberOfSets" :selected="exercise.selected">
                        {{ exercise.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="form-group row">
            <label v-bind:for="numberOfSetsId"
                   class="col-md-4 col-form-label text-md-right">Number of sets</label>
            <div class="col-md-6">
                <div v-bind:class="{ 'is-invalid': false }"></div>
                <input v-bind:id="numberOfSetsId" type="number" min="1" max="20" step="1" class="form-control" :value="numberOfSets"
                       name="name" required @input="updateNumberOfSets($event.target.value)">

                <span v-if="false" class="invalid-feedback" role="alert">
                                        <strong></strong>
            </span>
            </div>
        </div>
    </div>
</template>

<script>
    import CloseCross from "../CloseCross";

    let uuid = 0;

    export default {
        name: 'TypicalExerciseInput',
        components: {CloseCross},

        beforeCreate() {
            this.uuid = uuid.toString();
            uuid += 1;
        },

        created() {
            this.fetchAvailableExercises();
        },

        props: {
            preSelectedExercise: {
                required: false,
                default: null,
            },
            displayPosition: {
                type: Number,
                required: false,
                default: 0,
            },
            showCross: {
                type: Boolean,
                required: false,
                default: false,
            }
        },
        data() {
            return {
                exercise: {
                    id: null,
                    name: null,
                },
                numberOfSets: null,
                availableExercises: [],
            }
        },
        methods: {
            updateNumberOfSets(selectedValue) {
                this.numberOfSets = selectedValue;
                this.emitUpdateExerciseEvent();
            },
            updateExercise(selectedExerciseId) {
                this.exercise = this.findExerciseById(selectedExerciseId);
                this.emitUpdateExerciseEvent();
            },
            emitUpdateExerciseEvent() {
                const derivedExercise = {
                    numberOfSets: this.numberOfSets,
                    name: this.exercise.name,
                };

                this.$emit('updateExercise', this.displayPosition, derivedExercise);
            },
            findExerciseById(id) {
                return this.availableExercises.find(exercise => exercise.id === id);
            },
            fetchAvailableExercises() {
                // TODO api service layer.
                this.availableExercises = window.preloadData && window.preloadData.availableExercises || [];
            },
            getAvailableExercises() {
                let availableExercises = this.splicePreselectionIntoAvailable();

                return this.availableExercises;
            },
            splicePreselectionIntoAvailable() {
                const availableExercises = {...this.availableExercises};

                if (this.preSelectedExercise === null || !this.preSelectedExercise.name) {
                    return availableExercises;
                }

                this.numberOfSets = this.preSelectedExercise.numberOfSets;

                let foundByName = availableExercises.find(exercise => exercise.name === name);

                if (foundByName) {
                    foundByName.selected = true;
                } else {
                    availableExercises.unshift(this.preSelectedExercise);
                }

                return availableExercises;
            },
        },
        computed: {
            setsOfLabelPhrase() {
                return this.numberOfSets > 1 ? 'sets of:' : 'set of:';
            },
            numberOfSetsId() {
                return 'exercise-input-number-of-sets-' + uuid;
            },
            nameInputId() {
                return 'exercise-input-name-' + uuid;
            },
        },
    }
</script>

<style scoped>
    .draggable-section {
        padding: 20px 10px 10px;
        margin-bottom: 5px;
        position: relative;
    }
</style>