<template>
    <component
        :elevation="isSessionOverview ? 0 : 5"
        :is="isSessionOverview ? 'div' : 'VCard'"
        class="js-workout-drag-handle workout-card pa-4"
        max-width="960"
        width="100%"
    >
        <div class="px-4 py-2 d-flex justify-space-between align-center">
            <VTextField
                v-model="name"
                label="Workout name"
                hide-details
                variant="underlined"
            />

            <VMenu v-if="!isSessionOverview" bottom left>
                <template v-slot:activator="{ props }">
                    <VBtn icon flat v-bind="props">
                        <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                    </VBtn>
                </template>

                <VList>
                    <VListItem @click="deleteWorkout">
                        <VListItemTitle>Delete</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </div>

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
                    tag="div"
                    :forceFallback="true"
                    :delay="250"
                    :delayOnTouchOnly="true"
                    :group="{ name: 'exercises', pull: true, put: true }"
                    dragClass="drag-exercise"
                    ghostClass="ghost-exercise"
                    handle=".js-exercise-drag-handle"
                    itemKey="uuid"
                    v-model="orderedExercises"
                    @start="onDragStart"
                    @end="onDragEnd"
                >
                    <template #item="{ element: exercise }">
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
                @click.stop="addExercise"
            >
                Add exercise
            </AddNewButton>
            <VBtn
                elevation="1"
                v-if="isSessionOverview"
                :height="xs ? '4rem' : '72'"
                :ripple="false"
                :disabled="starting"
                :class="{
                    'flex-grow-1': true,
                    'start-workout-button': true,
                }"
                :width="smAndDown ? '100%' : undefined"
                color="success"
                @click="startWorkout"
            >
                <VIcon>{{ $svgIcons.mdiPlay }}</VIcon>
                Start workout
            </VBtn>
        </div>
        <VCardActions v-else class="justify-center" width="100%">
            <AddNewButton @click.stop="addExercise" width="100%">
                Add exercise
            </AddNewButton>
        </VCardActions>
    </component>
</template>

<script>
import ExerciseCard from './ExerciseCard';
import Draggable from 'vuedraggable';
import MissingValue from '../../util/MissingValue';
import AddNewButton from '../../formFields/AddNewButton';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useWorkoutSessionStore } from '../../../stores/workoutSession';
import { useDisplay } from 'vuetify';

export default {
    components: {
        AddNewButton,
        MissingValue,
        ExerciseCard,
        Draggable,
    },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        const workoutSessionStore = useWorkoutSessionStore();
        const { xs, smAndDown, mobile } = useDisplay();
        return {
            programBuilderStore,
            workoutSessionStore,
            xs,
            smAndDown,
            mobile,
        };
    },
    data() {
        const workout = this.programBuilderStore.getRoutine(this.workoutUuid);

        return {
            starting: false,
            isAddingExercise: false,
            name: workout?.name,
        };
    },
    props: {
        workoutUuid: {
            type: String,
            required: true,
        },
        isSessionOverview: Boolean,
    },
    computed: {
        workout() {
            return this.programBuilderStore.getRoutine(this.workoutUuid);
        },
        orderedExercises: {
            get() {
                return this.programBuilderStore.getOrderedExercises(
                    this.workoutUuid,
                );
            },
            set(newOrderedExercises) {
                // TODO: Implement updateExercisePositionFromOrder action in Pinia store
                this.programBuilderStore.updateExercisePositionFromOrder({
                    workoutUuid: this.workoutUuid,
                    newOrderedExercises,
                });
            },
        },
        hasNoExercises() {
            return this.orderedExercises.length === 0;
        },
    },
    watch: {
        workoutUuid() {
            debugger;
            if (!this.workoutUuid) {
                return;
            }

            const workout = this.programBuilderStore.getRoutine(
                this.workoutUuid,
            );
            this.name = workout?.name;
        },
        name() {
            debugger;
            if (!this.workoutUuid) {
                return;
            }

            this.programBuilderStore.updateRoutine(this.workoutUuid, {
                name: this.name,
            });
        },
    },
    methods: {
        addExercise() {
            if (this.isAddingExercise) {
                return;
            }

            this.isAddingExercise = true;
            this.programBuilderStore.addExerciseToWorkout({
                workoutUuid: this.workoutUuid,
            });

            // Reset the flag in the next tick after the store action completes
            this.$nextTick(() => {
                this.isAddingExercise = false;
            });
        },
        deleteWorkout() {
            this.programBuilderStore.deleteWorkout({
                workoutUuid: this.workoutUuid,
            });
        },
        onDragStart() {
            this.programBuilderStore.setDraggingExercise(true);
        },
        onDragEnd() {
            this.programBuilderStore.setDraggingExercise(false);
        },
        async startWorkout() {
            this.starting = true;

            // Create a new workout session from the updated master routine.
            await this.workoutSessionStore.startWorkout({
                originWorkout: this.workout,
            });

            // Finally, go to the first set in the workout.
            const firstSet = this.workoutSessionStore.firstSet;

            if (firstSet && firstSet.uuid) {
                // Replace so that back button doesn't go to the workout setup page.
                this.$router.replace({
                    name: 'SetOverviewPage',
                    params: { sessionSetUuid: firstSet.uuid },
                });
            } else {
                // Fallback - go to session overview instead
                this.$router.replace({
                    name: 'SessionOverviewPage',
                    params: {
                        workoutSessionUuid:
                            this.workoutSessionStore.workoutSession?.uuid,
                    },
                });
            }
        },
    },
};
</script>

<style scoped lang="scss">
.start-workout-button {
    border-style: dashed;

    :deep(.v-btn__content) {
        width: 0;
    }
}

.workout-card.v-card {
    border: solid 1px rgb(var(--v-theme-primary));
}

.workout-drag {
    border: solid 1px rgb(var(--v-theme-warning));
    animation: blink 0.5s step-end infinite alternate;
}

.workout-ghost {
    border: solid 1px rgb(var(--v-theme-warning));
    animation: blink 0.5s step-end infinite alternate;
}

@keyframes blink {
    50% {
        border: solid 1px rgb(var(--v-theme-warning));
    }
}
</style>
