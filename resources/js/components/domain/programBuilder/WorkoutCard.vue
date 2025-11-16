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
                    v-model="workout.routineExercises"
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

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import ExerciseCard from './ExerciseCard';
import Draggable from 'vuedraggable';
import MissingValue from '../../util/MissingValue';
import AddNewButton from '../../formFields/AddNewButton';
import { useWorkoutSessionStore } from '../../../stores/workoutSession';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useDisplay } from 'vuetify';
import {
    useUpdateWorkoutProgram,
    useWorkoutProgram,
} from './composibles/programBuilderQueries';

const props = defineProps({
    workoutProgramUuid: {
        type: String,
        required: true,
    },
    workoutUuid: {
        type: String,
        required: true,
    },
    isSessionOverview: Boolean,
});

const uuid = computed(() => {
    return props.workoutUuid;
});

const workoutProgramUuid = computed(() => {
    return props.workoutProgramUuid;
});

const { getWorkout } = useWorkoutProgram();
const { updateRoutine } = useUpdateWorkoutProgram();
const workout = getWorkout(props.workoutUuid);

const programBuilderStore = useProgramBuilderStore();
const workoutSessionStore = useWorkoutSessionStore();
const { xs, smAndDown } = useDisplay();
const router = useRouter();

const starting = ref(false);
const isAddingExercise = ref(false);
const name = ref(workout?.name);

const hasNoExercises = computed(() => {
    return workout.value.routineExercises.length === 0;
});

watch(
    () => props.workoutUuid,
    () => {
        if (!props.workoutUuid) {
            return;
        }
        name.value = workout?.name;
    },
);

const saveName = () => {
    updateRoutine(workoutProgramUuid.value, {
        uuid: uuid.value,
        name: name.value,
    });
};

const addExercise = () => {
    if (isAddingExercise.value) {
        return;
    }

    isAddingExercise.value = true;
    programBuilderStore.addExerciseToWorkout({
        workoutUuid: props.workoutUuid,
    });

    nextTick(() => {
        isAddingExercise.value = false;
    });
};

const deleteWorkout = () => {
    programBuilderStore.deleteWorkout({
        workoutUuid: props.workoutUuid,
    });
};

const onDragStart = () => {
    programBuilderStore.setDraggingExercise(true);
};

const onDragEnd = () => {
    programBuilderStore.setDraggingExercise(false);
};

const startWorkout = async () => {
    starting.value = true;

    await workoutSessionStore.startWorkout({
        originWorkout: workout.value,
    });

    const firstSet = workoutSessionStore.firstSet;

    if (firstSet && firstSet.uuid) {
        router.replace({
            name: 'SetOverviewPage',
            params: { sessionSetUuid: firstSet.uuid },
        });
    } else {
        router.replace({
            name: 'SessionOverviewPage',
            params: {
                workoutSessionUuid: workoutSessionStore.workoutSession?.uuid,
            },
        });
    }
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
