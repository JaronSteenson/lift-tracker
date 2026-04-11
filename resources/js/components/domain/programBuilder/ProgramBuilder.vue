<template>
    <div>
        <ProgramBuilderLoadingSkeleton v-if="isLoading" />
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
                            :updated-at="serverSyncUpdatedAt"
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
                        class="mb-4"
                        label="Program name"
                        v-model="name"
                        variant="underlined"
                        hide-details
                        @blur="saveName"
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
                        :modelValue="workouts"
                        @change="onWorkoutChange"
                    >
                        <template #item="{ element: workout }">
                            <div class="workout-card-wrapper pa-2 ma-2">
                                <WorkoutCard :workoutUuid="workout.uuid" />
                            </div>
                        </template>
                        <template #footer>
                            <div class="workout-card-wrapper pa-2 ma-2">
                                <AddNewButton
                                    @click="addWorkoutToProgram"
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

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import WorkoutCard from './WorkoutCard';
import NotFoundPage from '../../pages/NotFoundPage';
import Draggable from 'vuedraggable';
import AddNewButton from '../../formFields/AddNewButton';
import ProgramBuilderLoadingSkeleton from './ProgramBuilderLoadingSkeleton';
import ServerSyncInfo from '../../ServerSyncInfo';
import { useServerSyncInfoState } from '../../composibles/useServerSyncInfoState';
import AppBar from '../../AppBar';
import {
    useDeleteWorkoutProgram,
    useWorkoutProgramSaveState,
    useWorkoutProgram,
    useUpdateWorkoutProgram,
} from './composibles/programBuilderQueries';

const {
    workoutProgram: workoutProgramQuery,
    isLoading,
    error: fetchError,
} = useWorkoutProgram();
const {
    updateWorkoutProgram,
    addWorkoutToProgram: addWorkout,
    reorderWorkouts,
} = useUpdateWorkoutProgram();
const {
    isPending: isSavingWorkoutProgram,
    isError: hasSaveError,
    submittedAt: workoutProgramSaveSubmittedAt,
} = useWorkoutProgramSaveState();
const { deleteProgram } = useDeleteWorkoutProgram();

const route = useRoute();
const router = useRouter();

const isAddingWorkout = ref(false);

const notFound = computed(() => {
    return !isLoading.value && fetchError?.value;
});

const { status: serverSyncStatus, updatedAt: serverSyncUpdatedAt } =
    useServerSyncInfoState(workoutProgramQuery, {
        isPending: isSavingWorkoutProgram,
        isError: hasSaveError,
        submittedAt: workoutProgramSaveSubmittedAt,
    });

const uuid = computed(() => {
    return route.params.workoutProgramUuid;
});

const name = ref('');
const workouts = computed(() => {
    return workoutProgramQuery.value?.workoutProgramRoutines || [];
});

const saveName = () => {
    updateWorkoutProgram(uuid.value, { name: name.value });
};

watch(
    () => workoutProgramQuery.value,
    (newVal) => {
        if (newVal) {
            name.value = newVal.name ?? '';
        }
    },
    { immediate: true },
);

watch(
    () => workoutProgramQuery.value?.uuid,
    (newUuid) => {
        if (!route.params.workoutProgramUuid && newUuid) {
            router.replace({
                name: 'ProgramBuilderPage',
                params: { workoutProgramUuid: newUuid },
            });
        }
    },
);

const addWorkoutToProgram = () => {
    if (isAddingWorkout.value) {
        return;
    }

    isAddingWorkout.value = true;
    addWorkout(workoutProgramQuery.value.uuid);

    nextTick(() => {
        isAddingWorkout.value = false;
    });
};

const showDeleteConfirmation = async () => {
    const deleteConfirmed = window.confirm(
        'Are you sure you want to delete this program?',
    );

    if (deleteConfirmed) {
        await deleteProgram(workoutProgramQuery.value?.uuid);
        await router.push({ name: 'MyWorkoutProgramsPage' });
    }
};

const onWorkoutChange = (evt) => {
    reorderWorkouts(workoutProgramQuery.value.uuid, evt);
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
