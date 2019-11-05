<template>
    <div>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">{{ workoutRoutine.name || placeHolderName }}</h2>
            </div>

            <div class="row">
                <label v-bind:for="nameInputId"
                       class="col-md-4 col-form-label text-md-right">Workout name</label>
                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': false }"></div>
                    <input v-bind:id="nameInputId" type="text" class="form-control"
                           name="name" required v-model.lazy="workoutRoutine.name">

                    <span v-if="false" class="invalid-feedback" role="alert">
                                        <strong></strong>
            </span>
                </div>
            </div>

        </div>

        <div class="form-group">

            <div class="row">
                <label v-bind:for="typicalDayInputId"
                       class="col-md-4 col-form-label text-md-right">Typical day</label>
                <div class="col-md-6">
                    <WeekDaySelect v-model.lazy="workoutRoutine.normalDay" :initial-selection="workoutRoutine.normalDay" :select-id="typicalDayInputId"/>
                </div>
            </div>

        </div>

        <TypicalExercisesSection v-model.lazy="workoutRoutine.exercises"/>

        <hr class="form-section-divider">

    </div>
</template>

<script>
    import TypicalExercisesSection from './TypicalExercisesSection';
    import WeekDaySelect from "../formFields/WeekDaySelect";

    let uuid = 0;

    export default {
        name: 'WorkoutRoutineForm',
        components: {WeekDaySelect, TypicalExercisesSection},
        beforeCreate() {
            this.uuid = uuid.toString();
            uuid += 1;
        },
        props: {
            workoutRoutine: {
                default() {
                    return {
                        name: null,
                        normalDay: 'any',
                        routineExercises: [{}],
                    }
                },
            },
        },
        data() {
            return {
            };
        },
        watch: {
            workoutRoutine: {
                handler(newValue) {
                    this.$emit('input', newValue)
                },
                deep: true,
            },
        },
        computed: {
            nameInputId() {
                return `workout-routine-name-${this.uuid}`;
            },
            typicalDayInputId() {
                return `workout-routine-typical-day-${this.uuid}`;
            },
            placeHolderName() {
                return `Workout ${this.workoutRoutine.normalDay}`;
            },
        },
    };
</script>
