<template>
    <component :elevation="useInlineMobileView ? 0 : 5"
               :is="useInlineMobileView ? 'div' : 'VCard'"
               class="js-workout-drag-handle workout-builder-card"
               max-width="960"
               width="100%"
    >
        <VToolbar :flat="!isSessionOverview">
            <VTextField
                :autofocus="isEditingTitle"
                :hide-details="isSessionOverview"
                :label="isSessionOverview ? null : 'Workout name'"
                :single-line="isSessionOverview"
                @blur="finishEditingTitle"
                @keydown.enter="finishEditingTitle"
                @keydown.esc="abortEditingTitle"
                v-if="isEditingTitle"
                v-model="localState.name"
            >
                <template v-slot:append-outer>
                    <VBtn @click="abortEditingTitle" icon ref="abortEditingTitleButton">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </template>
            </VTextField>
            <VTextField
                :autofocus="isAddingNew"
                @blur="finishAddingNew"
                @keydown.enter="finishAddingNew"
                @keydown.esc="abortAddingNew"
                label="Workout name"
                v-else-if="isAddingNew"
                v-model="localState.name"
            >
                <template v-slot:append-outer>
                    <VBtn @click="abortAddingNew" icon ref="abortAddNewButton">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </template>
            </VTextField>
            <EditableTitle @click="editTitle" v-else>{{ nameDisplay }}</EditableTitle>

            <v-menu bottom left v-if="!isSessionOverview && !isAddingNew && !isEditingTitle">
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>mdi-dots-vertical</VIcon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="deleteWorkout">
                        <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-menu bottom left v-if="isSessionOverview">
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>mdi-dots-vertical</VIcon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="addExercise">
                        <v-list-item-title>Add exercise</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VToolbar>

            <VSubheader v-if="isSessionOverview">Today's session overview</VSubheader>

            <component :is="isSessionOverview ? 'div' : 'VRow'" class="mt-0">
                <component :is="isSessionOverview ? 'div' : 'VCol'">
                    <Draggable :forceFallback="true"
                               :group="{ name: 'exercises', pull: true, put: true }"
                               dragClass="elevation-24"
                               ghostClass="drop-placeholder-exercise"
                               handle=".js-exercise-drag-handle" v-model="orderedExercises">
                        <template v-for="(exercise) in orderedExercises">
                            <ExerciseCard :exercise-uuid="exercise.uuid" :key="exercise.uuid" ref="exercise-cards"/>
                        </template>
                    </Draggable>
                </component>
            </component>
        <VCardActions class="justify-center" width="100%">
                <VBtn v-if="isSessionOverview" :loading="starting" @click="startWorkout" color="success" x-large width="80%" class="my-5">
                    <VIcon left>mdi-clock-start</VIcon>
                    Start workout
                </VBtn>
                <VBtn v-else @click="addExercise" width="100%">
                    <VIcon left>mdi-plus</VIcon>
                    Add exercise
                </VBtn>
        </VcardActions>
    </component>
</template>

<script>
    import ExerciseCard from "./ExerciseCard";
    import Draggable from 'vuedraggable';
    import EditableTitle from "../../formFields/EditableTitle";

    export default {
        components: {
            EditableTitle,
            ExerciseCard,
            Draggable,
        },
        data() {
            return {
                isAddingNew: false,
                isEditingTitle: false,
                localState: {...this.$store.getters['programBuilder/getWorkout'](this.workoutUuid)},
                starting: false,
            }
        },
        props: {
            workoutUuid: {
                type: String,
                required: true,
            },
            isSessionOverview: Boolean,
        },
        mounted() {
            if (this.$store.getters['programBuilder/isJustAddedModelUuid'](this.workoutUuid)) {
                this.isAddingNew = true;
                this.$nextTick(() => {
                    this.$store.dispatch('programBuilder/forgetJustAddedUuid');
                });
            }
        },
        computed: {
            workout: {
                get() {
                    return this.$store.getters['programBuilder/getWorkout'](this.workoutUuid);
                },
                set(newState) {
                    this.$store.dispatch('programBuilder/updateWorkout', {uuid: this.workoutUuid, ...newState});
                }
            },
            nameDisplay() {
                return this.localState.name || 'Unnamed workout'
            },
            orderedExercises: {
                get() {
                    return this.$store.getters['programBuilder/getOrderedExercises'](this.workoutUuid);
                },
                set(newOrderedExercises) {
                    this.$store.dispatch('programBuilder/updateExercisePositionFromOrder', {
                        workoutUuid: this.workoutUuid,
                        newOrderedExercises
                    });
                }
            },
            useInlineMobileView() {
                return this.isSessionOverview && this.$vuetify.breakpoint.smAndDown;
            }
        },
        methods: {
            editTitle() {
                this.isEditingTitle = true;
            },
            finishEditingTitle(e) {
                // Allow canceling addition of element by clicking the cancel cross.
                if (e.relatedTarget === this.$refs.abortEditingTitleButton.$el) {
                    this.abortEditingTitle();
                    return;
                }

                this.isEditingTitle = false;
                this.workout = this.localState;
            },
            abortEditingTitle() {
                this.isEditingTitle = false;
                this.localState.name = this.workout.name;
            },
            finishAddingNew(e) {
                // Allow canceling addition of element by clicking the cancel cross.
                if (e.relatedTarget === this.$refs.abortAddNewButton.$el) {
                    this.abortAddingNew();
                    return;
                }

                this.isAddingNew = false;
                this.workout = this.localState;
            },
            abortAddingNew() {
                this.deleteWorkout();
            },
            addExercise() {
                this.$store.dispatch('programBuilder/addExerciseToWorkout', { workoutUuid: this.workoutUuid });
            },
            deleteWorkout() {
                this.$store.dispatch('programBuilder/deleteWorkout', { workoutUuid: this.workoutUuid });
            },
            async startWorkout() {
                this.starting = true;
                await this.$store.dispatch('programBuilder/finalizeChangesFormSessionSetup', { workoutUuid: this.workoutUuid });
                await this.$store.dispatch('workoutSession/startWorkout', { originWorkoutUuid: this.workoutUuid });
                this.starting = false;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .drop-placeholder-exercise {
        animation: blink .5s step-end infinite alternate;
    }

    .workout-drop-placeholder {
        .workout-builder-card {
            animation: blink .5s step-end infinite alternate;
        }
    }

    @keyframes blink {
        50% {
            border-color: var(--v-warning-base);
        }
    }
</style>
