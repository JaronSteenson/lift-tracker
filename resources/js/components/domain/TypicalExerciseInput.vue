<template>
    <div class="draggable-section">
        <CloseCross v-if="showCross" @click.native="$emit('removeExercise', displayPosition)"/>
        <div class="form-group row">
            <label v-bind:for="nameInputId"
                   class="col-md-4 col-form-label text-md-right">Exercise</label>
            <div class="col-md-6">
                <select v-bind:id="nameInputId" class="form-control" v-model="exercise.id">
                    <option v-for="exercise in exercises" v-bind:key="exercise.id" v-bind:value="exercise.id">
                        {{ exercise.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="form-group row">
            <label v-bind:for="numberOfSetsId"
                   class="col-md-4 col-form-label text-md-right">Number of sets</label>
            <div class="col-md-6">
                <div v-bind:class="{ 'is-invalid': validationErrors }"></div>
                <input v-bind:id="numberOfSetsId" type="number" min="1" max="10" step="1" class="form-control"
                       name="name" required v-model="exercise.numberOfSets">

                <span v-if="validationErrors" class="invalid-feedback" role="alert">
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
        props: {
            exercise: {
                type: Object,
                required: false,
                default: {
                    id: null,
                    name: null,
                    numberOfSets: 0,
                }
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
        computed: {
            setsOfLabelPhrase() {
                return this.numberOfSets > 1 ? 'sets of:' : 'set of:';
            },
            exercises() {
                return window.preloadData && window.preloadData.availableExercises || [];
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