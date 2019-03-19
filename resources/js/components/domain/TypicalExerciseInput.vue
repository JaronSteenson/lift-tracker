<template>
    <div class="draggable-component">
        <CloseCross></CloseCross>
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
            <label v-bind:for="nameInputId"
                   class="col-md-4 col-form-label text-md-right">Number of sets</label>
            <div class="col-md-6">
                <div v-bind:class="{ 'is-invalid': validationErrors }"></div>
                <input v-bind:id="exercise.id" type="number" min="1" max="10" step="1" class="form-control"
                       name="name" required v-model="exercise">

                <span v-if="validationErrors" class="invalid-feedback" role="alert">
                                        <strong></strong>
            </span>
            </div>
        </div>
    </div>
</template>

<script>
    import CloseCross from "../CloseCross";

    export default {
        name: 'TypicalExerciseInput',
        components: {CloseCross},
        props: {
            exercise: {
                type: Object,
                required: false,
                default: {
                    id: null,
                    name: null,
                    numberOfSets: 0,
                }
            }
        },
        computed: {
            setsOfLabelPhrase() {
                return this.numberOfSets > 1 ? 'sets of:' : 'set of:';
            },
            exercises() {
                return window.app && window.app.exercises || [];
            }
        }
    }
</script>

<style scoped>
    .draggable-component {
        padding: 20px 10px 10px;
        margin-bottom: 5px;
        position: relative;
    }
</style>