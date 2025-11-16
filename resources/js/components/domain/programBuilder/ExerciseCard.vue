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
            />
        </Teleport>
    </VCard>
</template>
<script setup>
import { ref, computed } from 'vue';
import EditExerciseModal from './EditExerciseModal';
import { minsSecDuration } from '../../../dates';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useWorkoutProgram } from './composibles/programBuilderQueries';

const props = defineProps({
    exerciseUuid: { type: String, required: true },
});

const { getExercise } = useWorkoutProgram();
const exercise = getExercise(props.exerciseUuid);

const programBuilderStore = useProgramBuilderStore();

const showEditModal = ref(false);

const nameDisplay = computed(() => {
    return exercise.name || 'Unnamed exercise';
});

const restPeriod = computed(() => {
    return minsSecDuration(exercise.restPeriod);
});

const setsAndRepsBlurb = computed(() => {
    let blurb = '';

    if (exercise.numberOfSets) {
        blurb += `${exercise.numberOfSets} sets`;

        if (exercise.weight) {
            blurb += ` of ${exercise.weight}kg`;
        }

        return blurb;
    }

    if (exercise.weight) {
        return `${exercise.weight}kg`;
    }

    return '';
});

const deleteExercise = () => {
    return programBuilderStore.deleteExercise({
        exerciseUuid: props.exerciseUuid,
    });
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
