<template>
    <component
        :elevation="isSessionOverview ? 0 : 5"
        :is="isSessionOverview ? 'div' : 'VCard'"
        class="workout-card pa-4"
        max-width="960"
        width="100%"
    >
        <div
            class="px-4 py-2 d-flex justify-space-between align-center"
            :class="{ 'js-workout-drag-handle': !isSessionOverview }"
        >
            <VTextField
                v-model="name"
                label="Workout name"
                hide-details
                variant="underlined"
                @blur="saveName"
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
            <component :is="isSessionOverview ? 'div' : 'VCol'" v-if="workout">
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
                    :modelValue="exercises"
                    @change="onExercisesChange"
                    @start="onDragStart"
                    @end="onDragEnd"
                >
                    <template #item="{ element: exercise }">
                        <ExerciseCard
                            :key="exercise.uuid"
                            :exercise-uuid="exercise.uuid"
                            :workoutProgramProp="workoutProgramProp"
                            :routineUuid="routineUuid"
                            :isDraggingExercise="isDraggingExercise"
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
            <AddNewButton @click="addExercise" width="100%">
                Add exercise
            </AddNewButton>
        </VCardActions>
    </component>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ExerciseCard from './ExerciseCard';
import Draggable from 'vuedraggable';
import MissingValue from '../../util/MissingValue';
import AddNewButton from '../../formFields/AddNewButton';
import { useDisplay } from 'vuetify';
import {
    useUpdateWorkoutProgram,
    useWorkoutProgram,
} from './composibles/programBuilderQueries';
import { useStartWorkout } from '../workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    workoutUuid: {
        type: String,
        required: true,
    },
    isSessionOverview: Boolean,
    workoutProgramProp: {
        type: Object,
        default: null,
    },
    // For session overview - the routine UUID to update the correct cache
    routineUuid: {
        type: String,
        default: null,
    },
});

const uuid = computed(() => {
    return props.workoutUuid;
});

const { workoutProgram: workoutProgramFromQuery } = useWorkoutProgram();
const {
    updateRoutine,
    addExerciseToWorkout,
    moveExercise,
    deleteWorkout: deleteWorkoutMutation,
} = useUpdateWorkoutProgram(props.routineUuid);

// Use prop if provided (session overview), otherwise use query (program builder)
const workoutProgram = computed(() => {
    if (props.workoutProgramProp) {
        // Props in Vue 3 are already unwrapped, so we need to wrap it for consistency
        return props.workoutProgramProp;
    }
    return workoutProgramFromQuery.value;
});

// Create a computed that directly accesses the workout from the reactive workoutProgram
const workout = computed(() => {
    if (!workoutProgram.value?.workoutProgramRoutines) {
        return null;
    }

    return workoutProgram.value.workoutProgramRoutines.find(
        (routine) => routine.uuid === props.workoutUuid,
    );
});

// Computed for exercises array
const exercises = computed(() => {
    const result = workout.value?.routineExercises || [];
    return result;
});

const { startWorkout: startWorkoutMutation } = useStartWorkout();
const { xs, smAndDown } = useDisplay();
const router = useRouter();

const starting = ref(false);
const isDraggingExercise = ref(false);
const name = ref(workout.value?.name);

const hasNoExercises = computed(() => {
    return workout.value?.routineExercises?.length === 0;
});

watch(
    () => workout.value?.name,
    (newName) => {
        name.value = newName ?? '';
    },
    { immediate: true },
);

const saveName = () => {
    updateRoutine(workoutProgram.value.uuid, {
        uuid: uuid.value,
        name: name.value,
    });
};

const addExercise = () => {
    addExerciseToWorkout(workoutProgram.value.uuid, uuid.value);
};

const deleteWorkout = () => {
    deleteWorkoutMutation(workoutProgram.value.uuid, props.workoutUuid);
};

const onExercisesChange = (evt) => {
    moveExercise(workoutProgram.value.uuid, props.workoutUuid, evt);
};

const onDragStart = () => {
    isDraggingExercise.value = true;
};

const onDragEnd = () => {
    window.setTimeout(() => {
        isDraggingExercise.value = false;
    }, 0);
};

const startWorkout = async () => {
    starting.value = true;

    startWorkoutMutation(
        {
            originWorkout: workout.value,
        },
        {
            onSuccess: (workoutSession) => {
                // Get first set from the new session
                const firstSet =
                    workoutSession?.sessionExercises?.[0]?.sessionSets?.[0] ||
                    null;

                if (firstSet && firstSet.uuid) {
                    router.replace({
                        name: 'SetOverviewPage',
                        params: { sessionSetUuid: firstSet.uuid },
                    });
                } else {
                    router.replace({
                        name: 'SessionOverviewPage',
                        params: {
                            workoutSessionUuid: workoutSession?.uuid,
                        },
                    });
                }
            },
            onError: () => {
                starting.value = false;
            },
        },
    );
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

    // Compromise for not being able to force top z-index/stacking context on moved exercise card.
    background-color: transparent !important;
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
