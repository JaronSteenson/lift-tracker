<template>
    <div>
        <div class="form-group">
            <div class="row">
                <h2 class="col-md-4 col-form-label text-md-right">{{ workoutRoutine.name }}</h2>
            </div>

            <div class="row">
                <label v-bind:for="nameInputId"
                       class="col-md-4 col-form-label text-md-right">Workout name</label>
                <div class="col-md-6">
                    <div v-bind:class="{ 'is-invalid': false }"></div>
                    <input v-bind:id="nameInputId" type="text" class="form-control"
                           name="name" required v-model="workoutRoutine.name">

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
                    <WeekDaySelect v-bind:select-id="typicalDayInputId"/>
                </div>
            </div>

        </div>

        <TypicalExercisesSection v-bind:exercises="workoutRoutine.exercises"/>

        <hr class="form-section-divider">

    </div>
</template>

<script>
    import TypicalExercisesSection from './TypicalExercisesSection';
    import WeekDaySelect from "../formFields/WeekDaySelect";

    export default {
        name: 'WorkoutRoutineForm',
        props: ['day'],
        components: {WeekDaySelect, TypicalExercisesSection},
        data() {
            return {
                workoutRoutine: {
                    name: `Workout ${this.day}`,
                    exercises: [{}],
                }
            }
        },
        computed: {
            nameInputId() {
                return `workout-routine-name-${this.$vnode.key}`;
            },
            typicalDayInputId() {
                return `workout-routine-typical-day-${this.$vnode.key}`;
            }
        }
    }
</script>
