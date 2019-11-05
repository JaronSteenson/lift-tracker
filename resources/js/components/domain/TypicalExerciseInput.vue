<template>
    <div class="draggable-section">
        <CloseCross v-if="showCross" @click.native="$emit('removeExercise', displayPosition)"/>

        <div class="form-group row">
            <label v-bind:for="nameInputId"
                   class="col-md-4 col-form-label text-md-right">Exercise</label>
            <div class="col-md-6">
                <select v-bind:id="nameInputId" class="form-control" @input="updateExercise($event.target.value)">
                    <option :value="null"></option>
                    <option v-for="exercise in getAvailableExercises()" :value="exercise.name" :selected="exercise.selected">
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
                <input v-bind:id="numberOfSetsId" type="number" min="1" max="20" step="1" class="form-control" :value="value.numberOfSets"
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
            },
            value: {
                required: false,
                default() {
                    return {
                        numberOfSets: 3,
                        name: null,
                        id: null,
                    }
                },
            }
        },
        methods: {
            updateNumberOfSets(selectedValue) {
                this.value.numberOfSets = selectedValue;
                this.emitUpdateExerciseEvent();
            },
            updateExercise(name) {
                this.value.name = name;
                this.emitUpdateExerciseEvent();
            },
            emitUpdateExerciseEvent() {
                this.$emit('updateExercise', this.displayPosition, this.value);
            },
            findExerciseById(id) {
                return this.availableExercises.find(exercise => exercise.id === id);
            },
            fetchAvailableExercises() {
                // TODO api service layer.
                const availableExercises = window.preloadData && window.preloadData.availableExercises || [];

                this.availableExercises = availableExercises.map(exercise => {
                    return {...exercise};
                });
            },
            getAvailableExercises() {
                return this.splicePreselectionIntoAvailable();
            },
            splicePreselectionIntoAvailable() {
                const availableExercises = [...this.availableExercises];
                const preSelectedExercise = this.preSelectedExercise;

                if (!preSelectedExercise.name) {
                    return availableExercises;
                }

                this.value.numberOfSets = preSelectedExercise.numberOfSets;

                // let foundByName = availableExercises.find(exercise => Object.assign({}, exercise).name === preSelectedExercise.name);
                let foundByName = availableExercises.find(exercise => exercise.name === preSelectedExercise.name);

                if (foundByName) {
                    foundByName.selected = true;
                } else {
                    preSelectedExercise.selected = true;
                    availableExercises.unshift(preSelectedExercise);
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
