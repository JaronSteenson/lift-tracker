<template>
    <div>
        <AppBar
            :title="pageTitle"
            :back-to="{
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: uuid },
            }"
        >
            <template v-slot:right>
                <ServerSyncInfo
                    :status="serverSyncStatus"
                    :updated-at="serverSyncUpdatedAt"
                />

                <VMenu bottom left>
                    <template v-slot:activator="{ props }">
                        <VBtn icon flat v-bind="props">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :disabled="!exercise.routineExercise"
                            @click="editingSource = true"
                        >
                            <VListItemTitle>Edit source</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="isFirstSetOfWorkout"
                            @click="lookBack"
                        >
                            <VListItemTitle>View previous</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="isLastSetOfWorkout"
                            @click="lookAhead"
                        >
                            <VListItemTitle>View next</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="!warmUpStarted"
                            @click="resetWarmUp"
                        >
                            <VListItemTitle>Reset warm-up</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="!restPeriodStarted"
                            @click="resetRestPeriod"
                        >
                            <VListItemTitle>Reset rest period</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="!isInProgressSet || isLastSetOfWorkout"
                            @click="startNextSet"
                        >
                            <VListItemTitle>Start next set</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="!isInProgressSet || isSkippedExercise"
                            @click="skipExercise"
                        >
                            <VListItemTitle>Skip exercise</VListItemTitle>
                        </VListItem>
                        <VListItem
                            v-if="isSkippedExercise"
                            @click="markExerciseNotSkipped"
                        >
                            <VListItemTitle
                                >Un-mark exercise skipped</VListItemTitle
                            >
                        </VListItem>
                        <VListItem
                            :disabled="!isInProgressWorkout"
                            @click="tryEndWorkout"
                        >
                            <VListItemTitle>Finish workout</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </AppBar>

        <NarrowContentContainer>
            <div class="d-flex align-center justify-center">
                <RouterLink
                    :class="{
                        'text-disabled': !previousExerciseLastSet?.uuid,
                        'cursor-pointer': previousExerciseLastSet?.uuid,
                    }"
                    :to="{
                        name: 'SetOverviewPage',
                        params: {
                            sessionSetUuid: previousExerciseLastSet?.uuid,
                        },
                    }"
                    :disabled="Boolean(previousExerciseLastSet)"
                >
                    <VIcon size="large">{{ $svgIcons.mdiChevronLeft }}</VIcon>
                </RouterLink>

                <div
                    class="d-flex justify-center align-center flex-grow-1 gap-2 py-2"
                >
                    <VChip
                        v-for="otherSet in setsForStepper"
                        :key="otherSet.uuid"
                        :color="getStepColor(otherSet)"
                        :variant="
                            set.uuid === otherSet.uuid ? 'elevated' : 'outlined'
                        "
                        @click="changeSetFromStepper(otherSet.position + 1)"
                        class="set-chip"
                    >
                        <VIcon v-if="otherSet.endedAt" start>
                            {{ $svgIcons.mdiCheck }}
                        </VIcon>
                        Set {{ otherSet.position + 1 }}
                    </VChip>
                </div>

                <RouterLink
                    :class="{
                        'text-disabled': !nextExerciseFirstSet?.uuid,
                        'cursor-pointer': nextExerciseFirstSet?.uuid,
                    }"
                    :to="{
                        name: 'SetOverviewPage',
                        params: {
                            sessionSetUuid: nextExerciseFirstSet?.uuid,
                        },
                    }"
                    :disabled="Boolean(nextExerciseFirstSet)"
                >
                    <VIcon size="large">{{ $svgIcons.mdiChevronRight }}</VIcon>
                </RouterLink>
            </div>

            <VCardText class="px-0">
                <VContainer class="py-0 px-0">
                    <VRow>
                        <VCol class="pt-0" cols="6" md="6" sm="6">
                            <VTextField
                                class="mt-0"
                                label="Weight (kg)"
                                type="number"
                                :step="2.5"
                                :max="9999"
                                :min="0"
                                v-model.number="weight"
                            />
                        </VCol>
                        <VCol class="pt-0" cols="6" md="6" sm="6">
                            <VTextField
                                class="mt-0"
                                label="Reps"
                                type="number"
                                :max="9999"
                                :min="0"
                                v-model.number="reps"
                            />
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol v-if="isInProgressWorkout" class="pt-0" cols="6">
                            <LabeledWorkoutDuration
                                :workoutSession="workoutSession"
                            />
                        </VCol>
                        <VCol class="pt-0" cols="6">
                            <TimerInput
                                v-if="!isLastSetOfExercise || !warmUpStarted"
                                :label="activeTimerLabel"
                                :disabled="isTimerRunning"
                                v-model="activeTimer"
                            />
                        </VCol>
                    </VRow>
                    <VRow v-if="!wasAddedOnTheFly" class="pt-0 mt-0">
                        <VCol class="pt-0 mt-0" cols="12" sm="6">
                            <span v-if="!hasLoadedExerciseHistory">
                                Loading history...
                                <VProgressLinear indeterminate />
                            </span>
                            <template v-else>
                                <template v-if="exerciseHistory.length > 1">
                                    <RouterLink
                                        :to="{
                                            $route,
                                            ...{
                                                query: { history: true },
                                            },
                                        }"
                                    >
                                        Exercise history
                                    </RouterLink>

                                    <SessionExerciseStatsModal
                                        url-search-param="history"
                                        :session-exercises="exerciseHistory"
                                        :start-index="1"
                                    />
                                </template>
                                <span v-else>
                                    This is the first time you are doing this
                                    exercise. History will appear here next
                                    time.
                                </span>
                            </template>
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol class="pt-0" cols="12">
                            <VTextarea
                                auto-grow
                                filled
                                label="Notes"
                                v-model="exerciseNotes"
                            />
                        </VCol>
                    </VRow>
                    <VRow
                        class="d-flex justify-center align-center"
                        v-if="shouldShowRestPeriodActions"
                    >
                        <VCol
                            class="pt-0"
                            :class="{ 'mt-2': !smAndUp }"
                            cols="6"
                        >
                            <RestPeriodTimer
                                :session-set-uuid="sessionSetUuid"
                                :label="activeTimerLabel"
                                data-testid="activeTimer"
                            />
                        </VCol>

                        <VCol class="pt-0 text-right" cols="6">
                            <VBtn
                                :height="xs ? '4rem' : null"
                                large
                                :disabled="isChangingSet"
                                :width="!smAndUp ? '100%' : null"
                                @click="endActiveTimer"
                                class="mt-2"
                                color="error"
                                data-testid="stopTimerButton"
                            >
                                <VIcon left>{{ $svgIcons.mdiStop }}</VIcon>
                                {{ activeTimerLabel }}
                            </VBtn>
                        </VCol>
                    </VRow>
                    <VRow
                        class="d-flex justify-center align-center"
                        v-else-if="
                            (isInProgressSet && restPeriodIsFinished) ||
                            (isLastSetOfWorkout && !workoutIsFinished) ||
                            isEndingWorkout
                        "
                    >
                        <VCol v-if="!isLastSetOfExercise" class="pt-0" cols="6">
                            <RestPeriodTimer
                                :session-set-uuid="sessionSetUuid"
                                label="Rest period finished"
                            />
                        </VCol>

                        <template v-if="shouldShowFinishActions">
                            <VCol
                                v-if="isLastSetOfExercise"
                                class="pt-0"
                                cols="6"
                            >
                                <div>
                                    <p v-if="isLastSetOfWorkout">
                                        There is no rest period because this is
                                        the last set for this workout.
                                    </p>
                                    <p v-else>
                                        There is no rest period because this is
                                        the last set for this exercise.
                                    </p>
                                </div>
                            </VCol>
                            <VCol
                                v-if="isInProgressSet || isEndingWorkout"
                                class="pt-0 text-right"
                                cols="6"
                            >
                                <VBtn
                                    v-if="isLastSetOfWorkout"
                                    :height="xs ? '4rem' : null"
                                    large
                                    :ripple="false"
                                    :disabled="isEndingWorkout"
                                    :width="!smAndUp ? '100%' : null"
                                    @click="endWorkout"
                                    class="mt-2"
                                    color="success"
                                    variant="flat"
                                    data-testid="finishWorkoutButton"
                                >
                                    <VIcon left>{{ $svgIcons.mdiCheck }}</VIcon>
                                    Finish
                                </VBtn>
                                <VBtn
                                    v-else
                                    :height="xs ? '4rem' : null"
                                    large
                                    :loading="isChangingSet"
                                    :width="!smAndUp ? '100%' : null"
                                    @click="startNextSet"
                                    class="mt-2"
                                    color="success"
                                    variant="flat"
                                >
                                    <VIcon left>{{ $svgIcons.mdiPlay }}</VIcon>
                                    Next set
                                </VBtn>
                            </VCol>
                        </template>
                    </VRow>
                </VContainer>

                <VCardActions
                    class="d-flex justify-center align-center mt-6"
                    v-if="showStartTimerButton"
                    width="100%"
                >
                    <VBtn
                        class="start-rest-button"
                        :height="xs ? '4rem' : null"
                        :width="!smAndUp ? '100%' : null"
                        x-large
                        color="success"
                        variant="flat"
                        @click="startActiveTimer"
                        data-testid="startTimerButton"
                    >
                        <VIcon left>
                            {{ $svgIcons.restPeriodStart }}
                        </VIcon>
                        <span class="mr-2">
                            {{ activeTimerLabel }}
                        </span>
                    </VBtn>
                </VCardActions>
            </VCardText>
        </NarrowContentContainer>
    </div>
    <EditExerciseModal
        v-model:value="editingSource"
        :routineExerciseUuid="exercise?.routineExercise.uuid"
        :routineUuid="workoutSession?.workoutProgramRoutine.uuid"
        :workoutProgramUuid="
            workoutSession?.workoutProgramRoutine?.workoutProgram.uuid
        "
    />
</template>

<script setup>
import { ref, computed, watch, toRef, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useAppStore } from '../../../stores/app';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import RestPeriodTimer from '../RestPeriodTimer';
import SessionExerciseStatsModal from './SessionExerciseStatsModal';
import ServerSyncInfo from './../../ServerSyncInfo';
import LabeledWorkoutDuration from '../LabeledWorkoutDuration';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import EditExerciseModal from '../../domain/programBuilder/EditExerciseModal';
import UuidHelper from '../../../UuidHelper';
import TimerInput from '../../formFields/TimerInput.vue';
import {
    useWorkoutSessionBySet,
    useUpdateWorkoutSession,
    useExerciseHistory,
    getSet,
    getExerciseBySet,
    isInProgressWorkout as checkIsInProgressWorkout,
    getPreviousSet as getPrevSet,
    getNextSet as getNextSetHelper,
    getCurrentSetForInProgressWorkout,
    getPreviousExerciseLastSet as getPrevExerciseLastSet,
    getNextExerciseFirstSet as getNextExerciseFirstSetHelper,
    isFirstSetOfWorkout as checkIsFirstSetOfWorkout,
    isLastSetOfWorkout as checkIsLastSetOfWorkout,
    isLastSetOfExercise as checkIsLastSetOfExercise,
    getWeightForCurrentSet,
    getRepsForCurrentSet,
    getRestPeriodForCurrentSet,
    getWarmUpForCurrentExercise,
    isDuringWarmUp as checkIsDuringWarmUp,
    isDuringRestPeriod as checkIsDuringRestPeriod,
    isWarmUpStarted as checkIsWarmUpStarted,
    isWarmUpEnded as checkIsWarmUpEnded,
    isRestPeriodStarted as checkIsRestPeriodStarted,
    isRestPeriodFinished as checkIsRestPeriodFinished,
} from './composibles/workoutSessionQueries';

const props = defineProps({
    sessionSetUuid: {
        type: String,
        required: true,
    },
});

const router = useRouter();
const appStore = useAppStore();
const programBuilderStore = useProgramBuilderStore();
const { xs, smAndUp } = useDisplay();

const { workoutSession } = useWorkoutSessionBySet(
    toRef(props, 'sessionSetUuid'),
);

// Get mutation functions
const {
    updateSetWeight: updateWeightMutation,
    updateSetReps: updateRepsMutation,
    updateExerciseWarmUpDuration,
    updateSetRestPeriodDuration,
    updateExerciseNotes: updateNotesMutation,
    updateExerciseSkipped,
    startSet,
    endSet,
    startWarmUp,
    endWarmUp,
    startRestPeriod,
    endRestPeriod,
    resetWarmUp: resetWarmUpMutation,
    resetRestPeriod: resetRestPeriodMutation,
    endWorkout: endWorkoutMutation,
} = useUpdateWorkoutSession();

// Local state
const hasLoadedExerciseHistory = ref(false);
const isEndingWorkout = ref(false);
const isChangingSet = ref(false);
const editingSource = ref(false);

// Server sync status
const serverSyncStatus = ref('ok');
const serverSyncUpdatedAt = ref(new Date().toISOString());

// Computed properties
const userIsLocalOnly = computed(() => appStore.userIsLocalOnly);
const uuid = computed(() => workoutSession.value?.uuid || null);

const pageTitle = computed(() => {
    if (!smAndUp.value) {
        return exercise.value.name;
    }
    return `${exercise.value.name} - set ${set.value.position + 1}`;
});

const set = computed(() => getSet(workoutSession.value, props.sessionSetUuid));

const exercise = computed(() =>
    getExerciseBySet(workoutSession.value, props.sessionSetUuid),
);

const inProgressSet = computed(() =>
    getCurrentSetForInProgressWorkout(workoutSession.value, uuid.value),
);

const isInProgressSet = computed(
    () => set.value?.uuid === inProgressSet.value?.uuid,
);

const isSkippedExercise = computed(() => exercise.value?.skipped);

const isInProgressWorkout = computed(() =>
    checkIsInProgressWorkout(workoutSession.value, uuid.value),
);

const workoutIsFinished = computed(
    () => workoutSession.value?.endedAt !== null,
);

const previousExerciseLastSet = computed(() =>
    getPrevExerciseLastSet(workoutSession.value, exercise.value?.uuid),
);

const previousSet = computed(() =>
    getPrevSet(workoutSession.value, props.sessionSetUuid),
);

const nextExerciseFirstSet = computed(() =>
    getNextExerciseFirstSetHelper(workoutSession.value, exercise.value?.uuid),
);

const nextSet = computed(() =>
    getNextSetHelper(workoutSession.value, props.sessionSetUuid),
);

const setsForStepper = computed(() => {
    const length = exercise.value?.sessionSets?.length || 0;
    const position = set.value?.position || 0;

    if (length <= 5) {
        return [...(exercise.value?.sessionSets || [])];
    }

    if (position < 3) {
        return exercise.value.sessionSets.slice(0, 5);
    }

    if (position > length - 4) {
        return exercise.value.sessionSets.slice(length - 5, length);
    }

    return exercise.value.sessionSets.slice(position - 2, position + 3);
});

const warmUpStarted = computed(() =>
    checkIsWarmUpStarted(workoutSession.value, exercise.value?.uuid),
);

const warmUpEnded = computed(() =>
    checkIsWarmUpEnded(workoutSession.value, exercise.value?.uuid),
);

const restPeriodStarted = computed(() =>
    checkIsRestPeriodStarted(workoutSession.value, props.sessionSetUuid),
);

const shouldShowRestPeriodActions = computed(() => {
    if (!isInProgressSet.value) {
        return false;
    }

    if (!isTimerRunning.value) {
        return false;
    }

    if (isLastSetOfExercise.value && setsForStepper.value.length !== 1) {
        return false;
    }

    return true;
});

const showStartTimerButton = computed(() => {
    if (!isInProgressSet.value) {
        return false;
    }

    if (isLastSetOfExercise.value && setsForStepper.value.length !== 1) {
        return false;
    }

    if (isLastSetOfExercise.value && setsForStepper.value.length === 1) {
        return !warmUpStarted.value;
    }

    return (
        !warmUpStarted.value || (warmUpEnded.value && !restPeriodStarted.value)
    );
});

const activeTimerLabel = computed(() => {
    if (set.value?.endedAt || warmUpEnded.value) {
        return 'Rest period';
    }
    return 'Warm-up';
});

const isTimerRunning = computed(() => {
    return (
        checkIsDuringWarmUp(workoutSession.value, exercise.value?.uuid) ||
        checkIsDuringRestPeriod(workoutSession.value, props.sessionSetUuid)
    );
});

const restPeriodIsFinished = computed(() => {
    if (isLastSetOfExercise.value) {
        return true;
    }

    return checkIsRestPeriodFinished(
        workoutSession.value,
        props.sessionSetUuid,
    );
});

const isFirstSetOfWorkout = computed(() =>
    checkIsFirstSetOfWorkout(workoutSession.value, props.sessionSetUuid),
);

const isLastSetOfWorkout = computed(() =>
    checkIsLastSetOfWorkout(workoutSession.value, props.sessionSetUuid),
);

const isLastSetOfExercise = computed(() =>
    checkIsLastSetOfExercise(workoutSession.value, props.sessionSetUuid),
);

const shouldShowFinishActions = computed(() => {
    if (!warmUpEnded.value) {
        return false;
    }

    return (
        isInProgressSet.value ||
        isEndingWorkout.value ||
        isLastSetOfExercise.value
    );
});

const allowInstanceEndWorkout = computed(
    () => isInProgressSet.value && isLastSetOfWorkout.value,
);

// Exercise history
const { exerciseHistory: exerciseHistoryData, isPending: isLoadingHistory } =
    useExerciseHistory(computed(() => exercise.value?.uuid));

const exerciseHistory = computed(() => {
    const history = exerciseHistoryData.value;

    if (!history) {
        return [];
    }

    // Keep today reactive
    return UuidHelper.replaceInCopy(history, {
        ...exercise.value,
        workoutSession: workoutSession.value,
    });
});

// Two-way computed for weight
const weight = computed({
    get() {
        return getWeightForCurrentSet(
            workoutSession.value,
            props.sessionSetUuid,
        );
    },
    set(weight) {
        updateWeightMutation(uuid.value, props.sessionSetUuid, weight);

        if (exercise.value?.routineExercise?.uuid) {
            programBuilderStore.updateExercise(
                exercise.value.routineExercise.uuid,
                { weight },
            );
        }
    },
});

// Two-way computed for reps
const reps = computed({
    get() {
        return getRepsForCurrentSet(workoutSession.value, props.sessionSetUuid);
    },
    set(reps) {
        updateRepsMutation(uuid.value, props.sessionSetUuid, reps);
    },
});

// Two-way computed for active timer
const activeTimer = computed({
    get() {
        if (set.value?.endedAt || warmUpEnded.value) {
            return getRestPeriodForCurrentSet(
                workoutSession.value,
                props.sessionSetUuid,
            );
        }

        return getWarmUpForCurrentExercise(
            workoutSession.value,
            exercise.value?.uuid,
        );
    },
    set(duration) {
        if (set.value?.endedAt || warmUpEnded.value) {
            updateSetRestPeriodDuration(
                uuid.value,
                props.sessionSetUuid,
                duration,
            );
            return;
        }

        updateExerciseWarmUpDuration(
            uuid.value,
            exercise.value?.uuid,
            duration,
        );
    },
});

// Two-way computed for exercise notes
const exerciseNotes = computed({
    get() {
        return exercise.value?.notes;
    },
    set(notes) {
        updateNotesMutation(uuid.value, exercise.value?.uuid, notes);
    },
});

const wasAddedOnTheFly = computed(() => exercise.value?.wasAddedOnTheFly);

const createdAt = computed(() => workoutSession.value?.createdAt);

// Methods
function getStepColor(otherSet) {
    if (otherSet.uuid === inProgressSet.value?.uuid) {
        return 'success';
    }

    return otherSet.uuid !== set.value?.uuid ? 'grey' : 'primary';
}

function changeSetFromStepper(requestedSet) {
    const setToChangeTo = exercise.value.sessionSets[requestedSet - 1];

    router.push({
        name: 'SetOverviewPage',
        params: { sessionSetUuid: setToChangeTo.uuid },
    });
}

async function lookAhead() {
    await router.push({
        name: 'SetOverviewPage',
        params: { sessionSetUuid: nextSet.value.uuid },
    });
}

async function lookBack() {
    await router.push({
        name: 'SetOverviewPage',
        params: { sessionSetUuid: previousSet.value.uuid },
    });
}

function tryEndWorkout() {
    if (allowInstanceEndWorkout.value) {
        endWorkout();
        return;
    }

    const finishConfirmed = window.confirm(
        'There are sets left in this workout, finish now?',
    );

    if (finishConfirmed) {
        endWorkout();
    }
}

async function endWorkout() {
    isEndingWorkout.value = true;
    isChangingSet.value = true;

    endWorkoutMutation(uuid.value);
    await router.push({
        name: 'SessionOverviewPage',
        params: { workoutSessionUuid: uuid.value },
    });

    isEndingWorkout.value = false;
    isChangingSet.value = false;
}

function resetWarmUp() {
    resetWarmUpMutation(uuid.value, exercise.value.uuid);
}

function resetRestPeriod() {
    resetRestPeriodMutation(uuid.value, set.value.uuid);
}

async function startNextSet() {
    isChangingSet.value = true;

    const nextSetUuid = nextSet.value.uuid;
    await endSet(uuid.value, set.value.uuid);
    await startSet(uuid.value, nextSetUuid);

    await router.push({
        name: 'SetOverviewPage',
        params: { sessionSetUuid: nextSetUuid },
    });

    isChangingSet.value = false;
}

async function skipExercise() {
    isChangingSet.value = true;
    const nextSetUuid = nextExerciseFirstSet.value?.uuid;

    updateExerciseSkipped(uuid.value, exercise.value.uuid, true);

    if (nextSetUuid) {
        startSet(uuid.value, nextSetUuid);
        await router.push({
            name: 'SetOverviewPage',
            params: { sessionSetUuid: nextSetUuid },
        });
    } else {
        tryEndWorkout();
    }

    isChangingSet.value = false;
}

async function markExerciseNotSkipped() {
    updateExerciseSkipped(uuid.value, exercise.value.uuid, false);
}

function startActiveTimer() {
    if (warmUpEnded.value) {
        startRestPeriod(uuid.value, props.sessionSetUuid);
    } else {
        startWarmUp(uuid.value, exercise.value.uuid);
    }
}

function endActiveTimer() {
    if (warmUpEnded.value) {
        endRestPeriod(uuid.value, props.sessionSetUuid);
    } else {
        endWarmUp(uuid.value, exercise.value.uuid);
    }
}

async function ensureExerciseHistoryAreLoaded() {
    // We must wait for the workout to be created on the server first
    if (userIsLocalOnly.value || wasAddedOnTheFly.value) {
        hasLoadedExerciseHistory.value = true;
        return;
    }

    // Exercise history is loaded via the query hook
    if (!isLoadingHistory.value && exerciseHistoryData.value) {
        hasLoadedExerciseHistory.value = true;
    }
}

// Watch for changes
watch(
    () => props.sessionSetUuid,
    () => {
        ensureExerciseHistoryAreLoaded();
    },
);

watch(createdAt, (value, oldValue) => {
    if (value !== null && oldValue === null) {
        ensureExerciseHistoryAreLoaded();
    }
});

watch(isLoadingHistory, (loading) => {
    if (!loading) {
        hasLoadedExerciseHistory.value = true;
    }
});

onMounted(() => {
    ensureExerciseHistoryAreLoaded();
});
</script>

<style lang="scss" scoped>
.start-rest-button {
    margin-bottom: 15px;
}

.set-navigation {
    // Prevent focus/loss of focus background.
    &:after {
        background: none !important;
    }

    &--disabled {
        color: var(--v-secondary-darken1) !important;
    }
}

.set-chip {
    min-width: 50px;
    text-align: center;
    vertical-align: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:not(.v-chip--disabled):hover {
        transform: translateY(-1px);
    }
}

.gap-2 {
    gap: 8px;
}
</style>
