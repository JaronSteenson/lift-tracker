<template>
    <div>
        <ProgramBuilderLoadingSkeleton v-if="loading" />
        <div v-else>
            <NotFoundPage v-if="notFound"
                >Sorry we couldn't find that program.</NotFoundPage
            >
            <template v-else>
                <AppBar
                    :title="
                        $vuetify.breakpoint.smAndDown ? 'Program builder' : null
                    "
                    :back-to="
                        $route.query.returnTo || {
                            name: 'MyWorkoutProgramsPage',
                        }
                    "
                >
                    <template v-if="$vuetify.breakpoint.mdAndUp" v-slot:middle>
                        <VTextField
                            v-if="editingName"
                            class="program-builder-title"
                            v-model="localState.name"
                            :autofocus="editingName"
                            label="Program name"
                            hide-details
                            single-line
                            @blur="finishEditingName"
                            @keydown.enter="finishEditingName"
                            @keydown.esc="abortEditingName"
                        >
                        </VTextField>
                        <VToolbarTitle v-else>
                            <EditableTitle @click="editingName = true">{{
                                nameForDisplay
                            }}</EditableTitle>
                        </VToolbarTitle>
                    </template>
                    <template v-slot:right>
                        <ServerSyncInfo
                            :status="saveStatus"
                            :updatedAt="inFocusProgram.updatedAt"
                        />
                        <VMenu bottom left>
                            <template v-slot:activator="{ on }">
                                <VBtn icon v-on="on">
                                    <VIcon>{{
                                        $svgIcons.mdiDotsVertical
                                    }}</VIcon>
                                </VBtn>
                            </template>

                            <VList>
                                <VList-item @click="showDeleteConfirmation">
                                    <VListItemTitle>Delete</VListItemTitle>
                                </VList-item>
                            </VList>
                        </VMenu>
                    </template>
                </AppBar>

                <VSheet class="mx-3">
                    <VTextField
                        v-if="$vuetify.breakpoint.smAndDown"
                        v-model="localState.name"
                        :autofocus="editingName"
                        single-line
                        hide-details
                        @blur="finishEditingName"
                        @keydown.enter="finishEditingName"
                        @keydown.esc="abortEditingName"
                        label="Program name"
                    />

                    <Draggable
                        class="main-draggable-container"
                        :forceFallback="true"
                        :delay="250"
                        :delayOnTouchOnly="true"
                        dragClass="workout-drag"
                        ghostClass="workout-drop-placeholder"
                        handle=".js-workout-drag-handle"
                        v-model="orderedWorkouts"
                    >
                        <div
                            class="workout-card-wrapper"
                            :key="workout.uuid"
                            v-for="workout in orderedWorkouts"
                        >
                            <WorkoutCard
                                :workoutUuid="workout.uuid"
                            ></WorkoutCard>
                        </div>
                        <div class="workout-card-wrapper">
                            <AddNewButton
                                @click="addWorkoutToProgram(null)"
                                draggable="false"
                                width="100%"
                            >
                                Add workout
                            </AddNewButton>
                        </div>
                    </Draggable>
                </VSheet>
            </template>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import WorkoutCard from './WorkoutCard';
import NotFoundPage from '../../pages/NotFoundPage';
import Draggable from 'vuedraggable';
import EditableTitle from '../../formFields/EditableTitle';
import AddNewButton from '../../formFields/AddNewButton';
import ProgramBuilderLoadingSkeleton from './ProgramBuilderLoadingSkeleton';
import ServerSyncInfo from '../../ServerSyncInfo';
import AppBar from '../../AppBar';

export default {
    components: {
        AddNewButton,
        ServerSyncInfo,
        WorkoutCard,
        NotFoundPage,
        Draggable,
        EditableTitle,
        AppBar,
        ProgramBuilderLoadingSkeleton,
    },
    props: {
        workoutProgramUuid: {
            type: String,
            required: false,
        },
    },
    async created() {
        await this.loadProgram();
    },
    data() {
        return {
            loading: false,
            fetchError: false,
            editingName: false,
            localState: {
                name: this.$store.state.programBuilder.inFocusProgram.name,
            },
        };
    },
    watch: {
        workoutProgramUuid() {
            if (this.workoutProgramUuid !== this.uuid) {
                this.loadProgram();
            }
        },
        uuid(newUuid) {
            // Started as a new builder (workoutProgramUuid prop), but has now bee assigned a uuid and saved (val).
            if (!this.workoutProgramUuid && newUuid) {
                this.$router.replace({
                    name: 'ProgramBuilderPage',
                    params: { workoutProgramUuid: newUuid },
                });
            }
        },
    },
    computed: {
        notFound() {
            return !this.loading && this.fetchError;
        },
        ...mapState('programBuilder', ['inFocusProgram', 'saveStatus']),
        ...mapGetters('programBuilder', ['hasMadeSignificantChangesFromNew']),
        uuid() {
            return this.inFocusProgram.uuid;
        },
        orderedWorkouts: {
            get() {
                return this.$store.getters['programBuilder/getOrderedWorkouts'];
            },
            set(orderedWorkouts) {
                this.$store.dispatch(
                    'programBuilder/updateWorkoutPositionFromOrder',
                    orderedWorkouts
                );
            },
        },
        nameForDisplay() {
            return this.name || 'Unnamed program';
        },
        name: {
            get() {
                return this.$store.state.programBuilder.inFocusProgram.name;
            },
            set(name) {
                this.$store.dispatch('programBuilder/updateName', name);
            },
        },
    },
    methods: {
        ...mapActions('programBuilder', ['addWorkoutToProgram', 'delete']),
        async loadProgram() {
            if (!this.workoutProgramUuid) {
                await this.$store.dispatch('programBuilder/startNew');
                this.resetLocalState();
                return;
            }

            this.loading = true;
            try {
                await this.$store.dispatch(
                    'programBuilder/fetch',
                    this.workoutProgramUuid
                );
                this.resetLocalState();
            } catch (e) {
                this.fetchError = true;
            }
            this.loading = false;
        },
        async showDeleteConfirmation() {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this program?'
            );

            if (deleteConfirmed) {
                await this.delete();
                await this.$router.push({ name: 'MyWorkoutProgramsPage' });
            }
        },
        finishEditingName() {
            this.editingName = false;

            if (this.name !== this.localState.name) {
                this.name = this.localState.name;
            }
        },
        abortEditingName() {
            this.localState.name = this.name;
            this.editingName = false;
        },
        resetLocalState() {
            this.localState = {
                name: this.$store.state.programBuilder.inFocusProgram.name,
            };
        },
    },
};
</script>

<style lang="scss" scoped>
.program-builder-title {
    max-width: 390px;
}

.builder-workouts-container {
    padding: 10px;
    max-height: calc(90vh - 48px);
}

.main-draggable-container {
    padding: 16px;
    display: flex;
    gap: 16px;
}

.workout-card-wrapper {
    width: 420px;
    min-width: 330px;
    max-width: 400px;
    max-height: calc(90vh);
    overflow-y: scroll;
    overflow-x: hidden;
}
</style>
