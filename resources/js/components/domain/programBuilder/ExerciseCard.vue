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
<script>
import EditExerciseModal from './EditExerciseModal';
import { minsSecDuration } from '../../../dates';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useSingleWorkoutProgramQuery } from '../../../api/WorkoutProgramService';
import { defineProps } from 'vue';

export default {
    components: { EditExerciseModal },
    setup() {
        const props = defineProps({
            exerciseUuid: { type: String, required: true },
        });

        const { getExercise } = useSingleWorkoutProgramQuery();
        const exercise = getExercise(props.exerciseUuid);

        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore, exercise };
    },
    data() {
        return {
            showEditModal: false,
            numberOfSetsOptions: [
                { text: 'One', value: 1 },
                { text: 'Two', value: 2 },
                { text: 'Three', value: 3 },
                { text: 'Four', value: 4 },
                { text: 'Five', value: 5 },
                { text: 'Six', value: 6 },
                { text: 'Seven', value: 7 },
                { text: 'Eight', value: 8 },
                { text: 'Nine', value: 9 },
                { text: 'Ten', value: 10 },
            ],
        };
    },
    computed: {
        nameDisplay() {
            return this.exercise.name || 'Unnamed exercise';
        },
        warmUp() {
            return minsSecDuration(this.exercise.warmUp);
        },
        restPeriod() {
            return minsSecDuration(this.exercise.restPeriod);
        },
        setsAndRepsBlurb() {
            let blurb = '';

            if (this.exercise.numberOfSets) {
                blurb += `${this.exercise.numberOfSets} sets`;

                if (this.exercise.weight) {
                    blurb += ` of ${this.exercise.weight}kg`;
                }

                return blurb;
            }

            if (this.exercise.weight) {
                return `${this.exercise.weight}kg`;
            }

            return '';
        },
    },
    methods: {
        deleteExercise() {
            return this.programBuilderStore.deleteExercise({
                exerciseUuid: this.exerciseUuid,
            });
        },
    },
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
