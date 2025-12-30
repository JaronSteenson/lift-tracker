<template>
    <VCard
        class="mx-3 my-2 exercise-card js-exercise-drag-handle"
        outlined
        role="button"
        :ripple="false"
        @click="showEditModal = true"
    >
        <VCardTitle class="exercise-card-title-wrapper d-flex align-center">
            <div class="exercise-card-title flex-grow-1">
                {{ nameDisplay }}
            </div>
            <VMenu bottom left>
                <template v-slot:activator="{ props }">
                    <VBtn icon flat v-bind="props">
                        <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                    </VBtn>
                </template>

                <VList>
                    <VListItem @click="showEditModal = true">
                        <VListItemTitle>Edit</VListItemTitle>
                    </VListItem>
                    <VListItem @click="deleteExercise">
                        <VListItemTitle>Delete</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </VCardTitle>
        <VCardText class="py-0">
            <VContainer>
                <VRow justify="space-between">
                    <VCol class="px-0 py-0">{{ setsAndRepsBlurb }}</VCol>
                    <VCol
                        v-if="exercise.restPeriod"
                        class="px-4 py-0"
                        style="text-align: right"
                    >
                        <VIcon class="v-icon--small">{{
                            $svgIcons.restPeriod
                        }}</VIcon>
                        {{ restPeriod }} rest
                    </VCol>
                </VRow>
            </VContainer>
        </VCardText>

        <Teleport to="body">
            <EditExerciseModal
                v-model:value="showEditModal"
                :exerciseUuid="exercise.uuid"
                :routineUuid="routineUuid"
            />
        </Teleport>
    </VCard>
</template>
<script setup>
import { ref, computed } from 'vue';
import EditExerciseModal from './EditExerciseModal';
import { minsSecDuration } from '../../../dates';
import UuidHelper from '../../../UuidHelper/index';
import {
    useUpdateWorkoutProgram,
    useWorkoutProgram,
} from './composibles/programBuilderQueries';

const props = defineProps({
    exerciseUuid: { type: String, required: true },
    workoutProgramProp: { type: Object, default: null },
    routineUuid: { type: String, default: null },
});

const { workoutProgram: workoutProgramFromQuery, getExercise } =
    useWorkoutProgram();
const { removeExerciseFromWorkout } = useUpdateWorkoutProgram(
    props.routineUuid,
);

// Use prop if provided (session overview), otherwise use query (program builder)
const workoutProgram = computed(() => {
    if (props.workoutProgramProp) {
        return props.workoutProgramProp;
    }
    return workoutProgramFromQuery.value;
});

// Make exercise reactive by using computed
const exercise = computed(() => {
    if (props.workoutProgramProp) {
        // When using prop, manually find the exercise
        return UuidHelper.findDeep(
            workoutProgram.value?.workoutProgramRoutines,
            props.exerciseUuid,
        );
    }
    return getExercise(props.exerciseUuid);
});

const showEditModal = ref(false);

const nameDisplay = computed(() => {
    return exercise.value?.name || 'Unnamed exercise';
});

const restPeriod = computed(() => {
    return minsSecDuration(exercise.value?.restPeriod);
});

const setsAndRepsBlurb = computed(() => {
    let blurb = '';

    if (exercise.value?.numberOfSets) {
        blurb += `${exercise.value.numberOfSets} sets`;

        if (exercise.value?.weight) {
            blurb += ` of ${exercise.value.weight}kg`;
        }

        return blurb;
    }

    if (exercise.value?.weight) {
        return `${exercise.value.weight}kg`;
    }

    return '';
});

const deleteExercise = () => {
    return removeExerciseFromWorkout(
        workoutProgram.value.uuid,
        props.exerciseUuid,
    );
};
</script>

<style scoped lang="scss">
.exercise-card-title-wrapper {
    align-items: flex-start;
}

.exercise-card {
    padding-bottom: 10px;
}

.exercise-card-title {
    width: 80%;
    cursor: pointer;
}

.drag-exercise {
    border: solid 1px rgb(var(--v-theme-warning));
    animation: blink 0.5s step-end infinite alternate;
}

.ghost-exercise {
    border: solid 1px rgb(var(--v-theme-warning));
    animation: blink 0.5s step-end infinite alternate;
}

@keyframes blink {
    50% {
        border: solid 1px rgb(var(--v-theme-warning));
    }
}

.exercise-card.v-card {
    border: solid 1px rgb(var(--v-theme-primary));
}

/* Higher z-index for dragged exercise cards - above everything */
.sortable-chosen {
    z-index: 9998 !important;
}

/* Ensure workout-card-wrapper doesn't block dragged exercises */
.workout-card-wrapper {
    z-index: 1;
}
</style>
