<template>
    <VCard
        class="mx-3 my-2 exercise-card js-exercise-drag-handle"
        outlined
        role="button"
        :ripple="false"
        @click="showEditModal = true"
    >
        <VCardTitle class="exercise-card-title-wrapper d-flex align-center">
            <div
                class="exercise-card-title flex-grow-1"
                @click="showEditModal = true"
            >
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

        <!-- Use Teleport to render modal outside this component's DOM tree -->
        <Teleport to="body">
            <EditExerciseModal
                v-if="showEditModal"
                :exercise-uuid="exercise.uuid"
                v-model="showEditModal"
            />
        </Teleport>
    </VCard>
</template>
<script>
import EditExerciseModal from './EditExerciseModal';
import { minsSecDuration } from '../../../dates';
import { useProgramBuilderStore } from '../../../stores/programBuilder';

export default {
    components: { EditExerciseModal },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore };
    },
    props: {
        exerciseUuid: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            showEditModal: false,
            localState: {
                ...this.programBuilderStore.getExercise(this.exerciseUuid),
            },
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
    mounted() {
        if (this.programBuilderStore.justAddedModelUuid === this.exerciseUuid) {
            this.$nextTick(() => {
                this.showEditModal = true;
                this.programBuilderStore.justAddedModelUuid = null;
            });
        }
    },
    computed: {
        exercise: {
            get() {
                return this.programBuilderStore.getExercise(this.exerciseUuid);
            },
            set(newState) {
                this.programBuilderStore.updateExercise({
                    exerciseUuid: this.exerciseUuid,
                    ...newState,
                });
            },
        },
        isDirty() {
            return Object.entries(this.localState).some((entry) => {
                const entryKey = entry[0];
                return this.localState[entryKey] !== this.exercise[entryKey];
            });
        },
        nameDisplay() {
            return this.localState.name || 'Unnamed exercise';
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
    watch: {
        exercise: {
            deep: true,
            handler(globalState) {
                this.localState = { ...globalState };
            },
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
