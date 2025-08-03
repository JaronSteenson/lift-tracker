<template>
    <component
        :elevation="isSessionOverview ? 0 : 5"
        :is="isSessionOverview ? 'div' : 'VCard'"
        class="js-workout-drag-handle workout-card"
        max-width="960"
        width="100%"
    >
        <div v-if="isSessionOverview" class="px-4 py-2">
            <div v-if="isEditingTitle" class="workout-title-edit">
                <VTextField
                    v-model="localState.name"
                    class="ma-0 pa-0"
                    :autofocus="isEditingTitle"
                    label="Workout name"
                    hide-details
                    @blur="finishEditingTitle"
                    @keydown.enter="finishEditingTitle"
                    @keydown.esc="abortEditingTitle"
                />
            </div>
            <EditableTitle v-else @click="editTitle">{{
                nameDisplay
            }}</EditableTitle>
        </div>
        <VToolbar v-else flat>
            <VCardTitle
                v-if="isEditingTitle"
                class="workout-title-edit workout-title-edit--editing-card"
            >
                <VTextField
                    v-model="localState.name"
                    :autofocus="isEditingTitle"
                    label="Workout name"
                    hide-details
                    @blur="finishEditingTitle"
                    @keydown.enter="finishEditingTitle"
                    @keydown.esc="abortEditingTitle"
                />
            </VCardTitle>
            <VCardTitle
                v-else-if="isAddingNew"
                class="workout-title-edit workout-title-edit--editing-card"
            >
                <VTextField
                    v-model="localState.name"
                    :autofocus="isAddingNew"
                    label="Workout name"
                    hide-details
                    @blur="finishAddingNew"
                    @keydown.enter="finishAddingNew"
                    @keydown.esc="abortAddingNew"
                >
                    <template v-slot:append-outer>
                        <VBtn
                            small
                            @click="abortAddingNew"
                            icon
                            ref="abortAddNewButton"
                        >
                            <VIcon>{{ $svgIcons.mdiClose }}</VIcon>
                        </VBtn>
                    </template>
                </VTextField>
            </VCardTitle>
            <EditableTitle @click="editTitle" v-else>
                {{ nameDisplay }}
            </EditableTitle>

            <v-menu bottom left v-if="!isAddingNew && !isEditingTitle">
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="deleteWorkout">
                        <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VToolbar>

        <template v-if="isSessionOverview">
            <VCardText v-if="hasNoExercises">
                <MissingValue class="d-flex justify-center">
                    No exercises
                </MissingValue>
            </VCardText>
        </template>

        <component
            :is="isSessionOverview ? 'div' : 'VRow'"
            class="mt-0"
            style="max-height: 100%"
        >
            <component :is="isSessionOverview ? 'div' : 'VCol'">
                <Draggable
                    :forceFallback="true"
                    :delay="250"
                    :delayOnTouchOnly="true"
                    :group="{ name: 'exercises', pull: true, put: true }"
                    dragClass="elevation-24"
                    ghostClass="drop-placeholder-exercise"
                    handle=".js-exercise-drag-handle"
                    v-model="orderedExercises"
                >
                    <template v-for="exercise in orderedExercises">
                        <ExerciseCard
                            :key="exercise.uuid"
                            :exercise-uuid="exercise.uuid"
                            ref="exercise-cards"
                        />
                    </template>
                </Draggable>
            </component>
        </component>
        <div
            v-if="isSessionOverview"
            class="px-2 pt-2 d-flex justify-space-between align-center gap-4 flex-wrap"
        >
            <AddNewButton
                class="flex-grow-1"
                :disabled="starting"
                @click="addExercise"
            >
                Add exercise
            </AddNewButton>
            <VBtn
                v-if="isSessionOverview"
                :height="$vuetify.breakpoint.xs ? '4rem' : '72'"
                :ripple="false"
                :disabled="starting"
                :class="{
                    'flex-grow-1': true,
                    'start-workout-button': true,
                }"
                :width="$vuetify.breakpoint.smAndDown ? '100%' : undefined"
                color="success"
                @click="startWorkout"
            >
                <VIcon>{{ $svgIcons.mdiPlay }}</VIcon>
                Start workout
            </VBtn>
        </div>
        <VCardActions v-else class="justify-center" width="100%">
            <AddNewButton @click="addExercise" width="100%">
                Add exercise
            </AddNewButton>
        </VCardActions>
    </component>
</template>

<script>
import ExerciseCard from './ExerciseCard';
import Draggable from 'vuedraggable';
import EditableTitle from '../../formFields/EditableTitle';
import MissingValue from '../../util/MissingValue';
import AddNewButton from '../../formFields/AddNewButton';

export default {
    components: {
        AddNewButton,
        MissingValue,
        EditableTitle,
        ExerciseCard,
        Draggable,
    },
    data() {
        return {
            isAddingNew: false,
            isEditingTitle: false,
            localState: {
                ...this.$store.getters['programBuilder/getWorkout'](
                    this.workoutUuid
                ),
            },
            starting: false,
        };
    },
    props: {
        workoutUuid: {
            type: String,
            required: true,
        },
        isSessionOverview: Boolean,
    },
    mounted() {
        if (
            this.$store.getters['programBuilder/isJustAddedModelUuid'](
                this.workoutUuid
            )
        ) {
            this.isAddingNew = true;
            this.$nextTick(() => {
                this.$store.dispatch('programBuilder/forgetJustAddedUuid');
            });
        }
    },
    computed: {
        workout: {
            get() {
                return this.$store.getters['programBuilder/getWorkout'](
                    this.workoutUuid
                );
            },
            set(newState) {
                this.$store.dispatch('programBuilder/updateWorkout', {
                    uuid: this.workoutUuid,
                    ...newState,
                });
            },
        },
        name: {
            get() {
                return this.localState.name;
            },
            set(name) {
                this.localState.name = name;
                this.finishEditingTitle();
            },
        },
        nameDisplay() {
            return this.localState.name || 'Unnamed workout';
        },
        orderedExercises: {
            get() {
                return this.$store.getters[
                    'programBuilder/getOrderedExercises'
                ](this.workoutUuid);
            },
            set(newOrderedExercises) {
                this.$store.dispatch(
                    'programBuilder/updateExercisePositionFromOrder',
                    {
                        workoutUuid: this.workoutUuid,
                        newOrderedExercises,
                    }
                );
            },
        },
        hasNoExercises() {
            return this.orderedExercises.length === 0;
        },
    },
    methods: {
        editTitle() {
            this.isEditingTitle = true;
        },
        finishEditingTitle() {
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
            this.$store.dispatch('programBuilder/addExerciseToWorkout', {
                workoutUuid: this.workoutUuid,
            });
        },
        deleteWorkout() {
            this.$store.dispatch('programBuilder/deleteWorkout', {
                workoutUuid: this.workoutUuid,
            });
        },
        startWorkout() {
            this.starting = true;

            // For some reason mobile devices get locked up for about a second here.
            // So we might as well just force that one second wait, so we can show the
            // loading spinner on the button, then this seems to happen very quickly
            // at the one second mark.
            setTimeout(
                async () => {
                    // Create a new workout session from the updated master routine.
                    await this.$store.dispatch('workoutSession/startWorkout', {
                        originWorkout: this.workout,
                    });

                    // Finally, go to the first set in the workout.
                    const firstSet =
                        this.$store.getters['workoutSession/firstSet'];
                    // Replace so that back button doesn't go to the workout setup page.
                    this.$router.replace({
                        name: 'SetOverviewPage',
                        params: { sessionSetUuid: firstSet.uuid },
                    });
                },
                this.$vuetify.breakpoint.xsOnly ? 250 : 0
            );
        },
    },
};
</script>

<style scoped lang="scss">
.start-workout-button {
    border-style: dashed;

    ::v-deep .v-btn__content {
        width: 0;
    }
}

.workout-card.v-card {
    border: solid 1px var(--v-primary-base);
}

.workout-title-edit {
    &--editing-card {
        margin-top: 10px;
        padding-left: 0;
        margin-left: 0;
        width: 100%;
    }
}

.sortable-chosen {
    .workout-card.v-card {
        border: 1px solid lightgray;
        animation: blink 0.5s step-end infinite alternate;
    }
}

.workout-drop-placeholder {
    .workout-card.v-card {
        border: solid 1px var(--v-warning-base);
    }
}

@keyframes blink {
    50% {
        border: solid 1px var(--v-warning-base);
    }
}
</style>
