<template>
    <div>
        <ProgramBuilderLoadingSkeleton v-if="loading" />
        <div v-else>
            <NotFoundPage v-if="notFound"
                >Sorry we couldn't find that program.</NotFoundPage
            >
            <template v-else>
                <AppBar
                    :back-to="
                        $route.query.returnTo || {
                            name: 'MyWorkoutProgramsPage',
                        }
                    "
                >
                    <template v-slot:right>
                        <ServerSyncInfo
                            :status="serverSyncStatus"
                            :updatedAt="inFocusProgram.updatedAt"
                        />
                        <VMenu bottom left>
                            <template v-slot:activator="{ props }">
                                <VBtn icon v-bind="props">
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

                <VSheet class="pa-2 ma-0">
                    <VTextField
                        v-model="localState.name"
                        variant="underlined"
                        hide-details
                        @blur="finishEditingName"
                        @keydown.enter="finishEditingName"
                        label="Program name"
                        class="mb-4"
                    />

                    <Draggable
                        class="main-draggable-container"
                        tag="div"
                        :forceFallback="true"
                        :delay="250"
                        :delayOnTouchOnly="true"
                        dragClass="workout-drag"
                        ghostClass="workout-ghost"
                        handle=".js-workout-drag-handle"
                        itemKey="uuid"
                        v-model="orderedWorkouts"
                        @start="onWorkoutDragStart"
                        @end="onWorkoutDragEnd"
                    >
                        <template #item="{ element: workout }">
                            <div class="workout-card-wrapper pa-2 ma-2">
                                <WorkoutCard :workoutUuid="workout.uuid" />
                            </div>
                        </template>
                        <template #footer>
                            <div class="workout-card-wrapper pa-2 ma-2">
                                <AddNewButton
                                    @click="addWorkoutToProgram(null)"
                                    draggable="false"
                                    width="100%"
                                    class="ma-2"
                                >
                                    Add workout
                                </AddNewButton>
                            </div>
                        </template>
                    </Draggable>
                </VSheet>
            </template>
        </div>
    </div>
</template>

<script>
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import WorkoutCard from './WorkoutCard';
import NotFoundPage from '../../pages/NotFoundPage';
import Draggable from 'vuedraggable';
import AddNewButton from '../../formFields/AddNewButton';
import ProgramBuilderLoadingSkeleton from './ProgramBuilderLoadingSkeleton';
import ServerSyncInfo from '../../ServerSyncInfo';
import AppBar from '../../AppBar';
import { useDisplay } from 'vuetify';

export default {
    components: {
        AddNewButton,
        ServerSyncInfo,
        WorkoutCard,
        NotFoundPage,
        Draggable,
        AppBar,
        ProgramBuilderLoadingSkeleton,
    },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        const display = useDisplay();
        return { programBuilderStore, display };
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
            isAddingWorkout: false,
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
        inFocusProgram() {
            return this.programBuilderStore.inFocusProgram;
        },
        serverSyncStatus() {
            return this.programBuilderStore.serverSyncStatus;
        },
        uuid() {
            return this.inFocusProgram.uuid;
        },
        orderedWorkouts: {
            get() {
                return this.programBuilderStore.getOrderedWorkouts;
            },
            set(orderedWorkouts) {
                this.programBuilderStore.updateWorkoutPositionFromOrder(
                    orderedWorkouts,
                );
            },
        },
        name: {
            get() {
                return this.programBuilderStore.inFocusProgram.name;
            },
            set(name) {
                this.programBuilderStore.updateName(name);
            },
        },
    },
    methods: {
        addWorkoutToProgram(data) {
            if (this.isAddingWorkout) {
                return;
            }

            this.isAddingWorkout = true;
            this.programBuilderStore.addWorkoutToProgram(data);

            // Reset the flag in the next tick
            this.$nextTick(() => {
                this.isAddingWorkout = false;
            });
        },
        async loadProgram() {
            if (!this.workoutProgramUuid) {
                await this.programBuilderStore.startNew();
                this.resetLocalState();
                return;
            }

            this.loading = true;
            try {
                await this.programBuilderStore.fetch(this.workoutProgramUuid);
                this.resetLocalState();
            } catch (e) {
                this.fetchError = true;
            }
            this.loading = false;
        },
        async showDeleteConfirmation() {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this program?',
            );

            if (deleteConfirmed) {
                await this.programBuilderStore.deleteProgram();
                await this.$router.push({ name: 'MyWorkoutProgramsPage' });
            }
        },
        finishEditingName() {
            if (this.name !== this.localState.name) {
                this.name = this.localState.name;
            }
        },
        resetLocalState() {
            this.localState = {
                name: this.programBuilderStore.inFocusProgram?.name || '',
            };
        },
        onWorkoutDragStart() {
            this.programBuilderStore.setDraggingWorkout(true);
        },
        onWorkoutDragEnd() {
            this.programBuilderStore.setDraggingWorkout(false);
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
    padding: 0;
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
