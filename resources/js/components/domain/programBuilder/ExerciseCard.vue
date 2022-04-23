<template>
    <VCard
        class="mx-3 my-2 exercise-card js-exercise-drag-handle"
        outlined
        role="button"
        :ripple="false"
        @click="showEditModal = true"
    >
        <VCardTitle v-if="isAddingNew">
            <VTextField
                :autofocus="isAddingNew"
                @blur="finishAddingNew"
                @keydown.enter="finishAddingNew"
                @keydown.esc="abortAddingNew"
                label="Exercise name"
                v-model="localState.name"
            >
                <template v-slot:append-outer>
                    <VBtn icon @click="abortAddingNew" ref="abortAddNewButton">
                        <VIcon>{{ $svgIcons.mdiClose }}</VIcon>
                    </VBtn>
                </template>
            </VTextField>
        </VCardTitle>
        <template v-else>
            <VCardTitle>
                <EditableTitle @click="showEditModal = true">{{
                    nameDisplay
                }}</EditableTitle>
                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VList-item @click="showEditModal = true">
                            <VListItemTitle>Edit</VListItemTitle>
                        </VList-item>
                        <VList-item @click="deleteExercise">
                            <VListItemTitle>Delete</VListItemTitle>
                        </VList-item>
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
                                $svgIcons.mdiClock
                            }}</VIcon>
                            {{ restPeriod }} rest
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>

            <EditExerciseModal
                v-if="showEditModal"
                :exercise-uuid="exercise.uuid"
                v-model="showEditModal"
            />
        </template>
    </VCard>
</template>
<script>
import EditableTitle from '../../formFields/EditableTitle';
import EditExerciseModal from './EditExerciseModal';
import exerciseMixin from './mixins/exerciseMixin';
import { minsSecDuration } from '../../../dates';

export default {
    mixins: [exerciseMixin],
    components: { EditableTitle, EditExerciseModal },
    props: {
        exerciseUuid: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            isAddingNew: false,
            showEditModal: false,
        };
    },
    mounted() {
        if (
            this.$store.getters['programBuilder/isJustAddedModelUuid'](
                this.exerciseUuid
            )
        ) {
            this.isAddingNew = true;

            this.$nextTick(() => {
                this.$store.dispatch('programBuilder/forgetJustAddedUuid');
            });
        }
    },
    computed: {
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
        finishAddingNew(e) {
            // Allow canceling addition of element by clicking the cancel cross.
            if (e.relatedTarget === this.$refs.abortAddNewButton.$el) {
                this.abortAddingNew();
                return;
            }

            this.isAddingNew = false;
            this.exercise = this.localState;
        },
        abortAddingNew() {
            this.deleteExercise();
        },
    },
};
</script>

<style scoped lang="scss">
.exercise-card {
    padding-bottom: 10px;
}

.exercise-card.theme--light.v-sheet--outlined {
    border: solid 1px var(--v-primary-base);

    &.sortable-chosen {
        border: 1px solid lightgray;
        animation: blink 0.5s step-end infinite alternate;
    }

    &.drop-placeholder-exercise {
        border: solid 1px var(--v-warning-base);
    }

    @keyframes blink {
        50% {
            border: solid 1px var(--v-warning-base);
        }
    }
}
</style>
