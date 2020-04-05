<template>
    <VCard class="js-workout-drag-handle drag-handle" width="100%">
        <VCardTitle>
            <VTextField placeholder="Enter workout name" v-model="name" :autofocus="!workout.id"/>

            <v-menu bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn
                        icon
                        v-on="on"
                    >
                        <v-icon>mdi-dots-vertical</v-icon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="deleteWorkout">
                        <v-list-item-title>Delete this workout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VCardTitle>

        <div class="row">
            <div class="col">
                <Draggable :forceFallback="true" :group="{ name: 'exercises', pull: true, put: true }"
                           dragClass="dragging-exercise-card"
                           handle=".js-exercise-drag-handle" v-model="orderedExercises">
                    <template v-for="(exercise) in orderedExercises">
                        <ExerciseCard :exercise-cid="exercise.cid" :key="exercise.cid"/>
                    </template>
                </Draggable>
            </div>
        </div>

        <VBtn @click="addExercise" width="100%">
            <v-icon left>mdi-plus</v-icon>
            Add exercise
        </VBtn>
    </VCard>
</template>

<script>
    import ExerciseCard from "./ExerciseCard";
    import Draggable from 'vuedraggable';

    export default {
        components: {
            ExerciseCard,
            Draggable,
        },
        props: {
            workoutCid: {
                type: String,
                required: true,
            }
        },
        computed: {
            workout: {
                get() {
                    return this.$store.getters['programBuilder/getWorkout'](this.workoutCid);
                }
            },
            name: {
                get() {
                    return this.workout.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateWorkoutName', {cid: this.workoutCid, name});
                }
            },
            orderedExercises: {
                get: function get() {
                    return this.$store.getters['programBuilder/getOrderedExercises'](this.workoutCid);
                },
                set: function set(orderedExercises) {
                    this.$store.dispatch('programBuilder/updateExercisePositionFromOrder', {
                        workoutCid: this.workoutCid,
                        orderedExercises
                    });
                }
            }
        },
        methods: {
            addExercise() {
                this.$store.dispatch('programBuilder/addExerciseToWorkout', {workoutCid: this.workoutCid});
            },

            deleteWorkout() {
                this.$store.dispatch('programBuilder/deleteWorkout', {cid: this.workoutCid});
            }
        }
    }
</script>

<style scoped>
    .workout-name {
        /* 40px for some space for the drop down menu button. */
        min-width: calc(90% - 40px);
        max-width: calc(90% - 40px);
        width: calc(90% - 40px);
        margin-right: 40px;
    }

    .dropdown {
        position: absolute;
        right: 0;
        top: 0;
    }

</style>
