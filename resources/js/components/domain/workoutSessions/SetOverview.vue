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
                            <VTextField
                                v-if="!isLastSetOfExercise || !warmUpStarted"
                                :label="activeTimerLabel"
                                :disabled="isTimerRunning"
                                v-model.number="activeTimer"
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
        :exerciseUuid="exercise.routineExercise.uuid"
    />
</template>

<script>
import { useWorkoutSessionStore } from '../../../stores/workoutSession';
import { useAppStore } from '../../../stores/app';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useDisplay } from 'vuetify';
import RestPeriodTimer from '../RestPeriodTimer';
import SessionExerciseStatsModal from './SessionExerciseStatsModal';
import ServerSyncInfo from './../../ServerSyncInfo';
import LabeledWorkoutDuration from '../LabeledWorkoutDuration';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import EditExerciseModal from '../../domain/programBuilder/EditExerciseModal';
import UuidHelper from '../../../UuidHelper';

export default {
    components: {
        EditExerciseModal,
        AppBar,
        NarrowContentContainer,
        LabeledWorkoutDuration,
        ServerSyncInfo,
        SessionExerciseStatsModal,
        RestPeriodTimer,
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        const appStore = useAppStore();
        const programBuilderStore = useProgramBuilderStore();
        const { xs, smAndUp, mobile } = useDisplay();
        return {
            workoutSessionStore,
            appStore,
            programBuilderStore,
            xs,
            smAndUp,
            mobile,
        };
    },
    props: {
        sessionSetUuid: {
            type: String,
            required: true,
        },
    },
    created() {
        this.ensureExerciseHistoryAreLoaded();
    },
    data() {
        return {
            hasLoadedExerciseHistory: false,
            isEndingWorkout: false,
            forceUpdate: 0,
            editingSource: false,
        };
    },
    computed: {
        serverSyncStatus() {
            return this.workoutSessionStore.serverSyncStatus;
        },
        serverSyncUpdatedAt() {
            return this.workoutSessionStore.serverSyncUpdatedAt;
        },
        userIsLocalOnly() {
            return this.appStore.userIsLocalOnly;
        },
        workoutName() {
            return this.workoutSessionStore.workoutName;
        },
        workoutSession() {
            return this.workoutSessionStore.workoutSession;
        },
        uuid() {
            return this.workoutSessionStore.uuid;
        },
        pageTitle() {
            if (!this.smAndUp) {
                return this.exercise.name;
            }

            return `${this.exercise.name} - set ${this.set.position + 1}`;
        },
        set() {
            return this.workoutSessionStore.set(this.sessionSetUuid);
        },
        isInProgressSet() {
            return this.set.uuid === this.inProgressSet?.uuid;
        },
        isSkippedExercise() {
            return this.exercise.skipped;
        },
        isInProgressWorkout() {
            return this.workoutSessionStore.isInProgressWorkout(
                this.workoutSession.uuid,
            );
        },
        workoutIsFinished() {
            return this.workoutSession.endedAt !== null;
        },
        shouldShowFinishActions() {
            if (!this.warmUpEnded) {
                return false;
            }

            return (
                this.isInProgressSet ||
                this.isEndingWorkout ||
                this.isLastSetOfExercise
            );
        },
        allowInstanceEndWorkout() {
            return this.isInProgressSet && this.isLastSetOfWorkout;
        },
        previousExerciseLastSet() {
            return this.workoutSessionStore.previousExerciseLastSet(
                this.exercise.uuid,
            );
        },
        previousSet() {
            return this.workoutSessionStore.previousSet(this.sessionSetUuid);
        },
        nextExerciseFirstSet() {
            return this.workoutSessionStore.nextExerciseFirstSet(
                this.exercise.uuid,
            );
        },
        nextSet() {
            return this.workoutSessionStore.nextSet(this.sessionSetUuid);
        },
        inProgressSet() {
            return this.workoutSessionStore.currentSetForInProgressWorkout(
                this.uuid,
            );
        },
        /**
         * If there are more than five sets limit to displaying five at a time (one each side of the current),
         * two  before/after if at the start/end.
         * @return {object}
         */
        setsForStepper() {
            const length = this.exercise.sessionSets.length;
            const position = this.set.position;

            if (length <= 5) {
                return [...this.exercise.sessionSets];
            }

            if (position < 3) {
                return this.exercise.sessionSets.slice(0, 5);
            }

            if (position > length - 4) {
                return this.exercise.sessionSets.slice(length - 5, length);
            }

            return this.exercise.sessionSets.slice(position - 2, position + 3);
        },
        exercise() {
            return this.workoutSessionStore.exerciseBySet(this.sessionSetUuid);
        },
        warmUpStarted() {
            return this.workoutSessionStore.warmUpStarted(this.exercise.uuid);
        },
        warmUpEnded() {
            return this.workoutSessionStore.warmUpEnded(this.exercise.uuid);
        },
        restPeriodStarted() {
            return this.workoutSessionStore.restPeriodStarted(
                this.sessionSetUuid,
            );
        },
        shouldShowRestPeriodActions() {
            if (!this.isInProgressSet) {
                return false;
            }

            if (!this.isTimerRunning) {
                return false;
            }

            if (this.isLastSetOfExercise && this.setsForStepper.length !== 1) {
                return false;
            }

            return true;
        },
        showStartTimerButton() {
            if (!this.isInProgressSet) {
                return false;
            }

            if (this.isLastSetOfExercise && this.setsForStepper.length !== 1) {
                return false;
            }

            if (this.isLastSetOfExercise && this.setsForStepper.length === 1) {
                return !this.warmUpStarted;
            }

            return (
                !this.warmUpStarted ||
                (this.warmUpEnded && !this.restPeriodStarted)
            );
        },
        activeTimerLabel() {
            if (this.set.endedAt || this.warmUpEnded) {
                return 'Rest period';
            }
            return 'Warm-up';
        },
        isTimerRunning() {
            return (
                this.workoutSessionStore.isDuringWarmUp(this.exercise.uuid) ||
                this.workoutSessionStore.isDuringRestPeriod(this.sessionSetUuid)
            );
        },
        restPeriodIsFinished() {
            if (this.isLastSetOfExercise) {
                return true;
            }

            return this.workoutSessionStore.restPeriodIsFinished(
                this.sessionSetUuid,
            );
        },
        isFirstSetOfWorkout() {
            return this.workoutSessionStore.isFirstSetOfWorkout(
                this.sessionSetUuid,
            );
        },
        isLastSetOfWorkout() {
            return this.workoutSessionStore.isLastSetOfWorkout(
                this.sessionSetUuid,
            );
        },
        isLastSetOfExercise() {
            return this.workoutSessionStore.isLastSetOfExercise(
                this.sessionSetUuid,
            );
        },
        exerciseHistory() {
            const history = this.workoutSessionStore.exerciseHistory(
                this.exercise.uuid,
            );

            if (!history) {
                return [];
            }

            // Keep today reactive.
            return UuidHelper.replaceInCopy(history, {
                ...this.exercise,
                workoutSession: this.workoutSession,
            });
        },
        isChangingSet: {
            get() {
                return this.workoutSessionStore.isChangingSet;
            },
            set(value) {
                this.workoutSessionStore.isChangingSet = value;
            },
        },
        weight: {
            get() {
                return this.workoutSessionStore.weightForCurrentSet(
                    this.sessionSetUuid,
                );
            },
            set(weight) {
                this.workoutSessionStore.updateSetWeight({
                    uuid: this.sessionSetUuid,
                    weight,
                });

                this.programBuilderStore.updateExercise(
                    this.exercise.routineExercise.uuid,
                    { weight },
                );
            },
        },
        reps: {
            get() {
                return this.workoutSessionStore.repsForCurrentSet(
                    this.sessionSetUuid,
                );
            },
            set(reps) {
                this.workoutSessionStore.updateSetReps({
                    uuid: this.sessionSetUuid,
                    reps,
                });
            },
        },
        warmUp: {
            get() {
                return this.workoutSessionStore.warmUpForCurrentExercise(
                    this.exercise.uuid,
                );
            },
            set(warmUpDuration) {
                this.workoutSessionStore.updateExerciseWarmUpDuration({
                    uuid: this.exercise.uuid,
                    warmUpDuration,
                });
            },
        },
        activeTimer: {
            get() {
                if (this.set.endedAt || this.warmUpEnded) {
                    return this.workoutSessionStore.restPeriodForCurrentSet(
                        this.sessionSetUuid,
                    );
                }

                return this.workoutSessionStore.warmUpForCurrentExercise(
                    this.exercise.uuid,
                );
            },
            set(duration) {
                if (this.set.endedAt || this.warmUpEnded) {
                    this.workoutSessionStore.updateSetRestPeriodDuration({
                        uuid: this.sessionSetUuid,
                        restPeriodDuration: duration,
                    });
                    return;
                }

                this.workoutSessionStore.updateExerciseWarmUpDuration({
                    uuid: this.exercise.uuid,
                    warmUpDuration: duration,
                });
            },
        },
        exerciseNotes: {
            get() {
                return this.exercise.notes;
            },
            set(notes) {
                this.workoutSessionStore.updateExerciseNotes({
                    uuid: this.exercise.uuid,
                    notes,
                });
            },
        },
        wasAddedOnTheFly() {
            return this.exercise?.wasAddedOnTheFly;
        },
        createdAt() {
            return this.workoutSession.createdAt;
        },
    },
    methods: {
        getStepColor(otherSet) {
            if (otherSet.uuid === this.inProgressSet?.uuid) {
                return 'success';
            }

            return otherSet.uuid !== this.set.uuid ? 'grey' : 'primary';
        },
        changeSetFromStepper(requestedSet) {
            const setToChangeTo = this.exercise.sessionSets[requestedSet - 1];

            this.$router.push({
                name: 'SetOverviewPage',
                params: { sessionSetUuid: setToChangeTo.uuid },
            });
        },
        async lookAhead() {
            await this.$router.push({
                name: 'SetOverviewPage',
                params: { sessionSetUuid: this.nextSet.uuid },
            });
        },
        async lookBack() {
            await this.$router.push({
                name: 'SetOverviewPage',
                params: { sessionSetUuid: this.previousSet.uuid },
            });
        },
        tryEndWorkout() {
            if (this.allowInstanceEndWorkout) {
                this.endWorkout();
                return;
            }

            const finishConfirmed = window.confirm(
                'There are sets left in this workout, finish now?',
            );

            if (finishConfirmed) {
                this.endWorkout();
            }
        },
        async endWorkout() {
            this.isEndingWorkout = true;
            this.isChangingSet = true;

            this.workoutSessionStore.endWorkout();
            await this.$router.push({
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: this.uuid },
            });

            this.isEndingWorkout = false;
            this.isChangingSet = false;
        },
        resetWarmUp() {
            const uuid = this.exercise.uuid;
            this.workoutSessionStore.resetWarmUp({
                uuid,
            });
        },
        resetRestPeriod() {
            const uuid = this.set.uuid;
            this.workoutSessionStore.resetRestPeriod({
                uuid,
            });
        },
        async startNextSet() {
            this.isChangingSet = true;
            await this.workoutSessionStore.startNextSet({
                uuid: this.set.uuid,
            });
            this.isChangingSet = false;
        },
        async skipExercise() {
            this.isChangingSet = true;
            const nextSetUuid = this.nextExerciseFirstSet?.uuid;

            await this.workoutSessionStore.skipExercise({
                uuid: this.exercise.uuid,
            });

            if (nextSetUuid) {
                await this.workoutSessionStore.startSet({
                    uuid: nextSetUuid,
                });
                await this.$router.push({
                    name: 'SetOverviewPage',
                    params: { sessionSetUuid: nextSetUuid },
                });
            } else {
                this.tryEndWorkout();
            }

            this.isChangingSet = false;
        },
        async markExerciseNotSkipped() {
            await this.workoutSessionStore.updateExerciseSkipped({
                uuid: this.exercise.uuid,
                skipped: false,
            });
        },
        startActiveTimer() {
            if (this.warmUpEnded) {
                this.workoutSessionStore.startRestPeriod({
                    uuid: this.sessionSetUuid,
                });
            } else {
                this.workoutSessionStore.startWarmUp({
                    uuid: this.exercise.uuid,
                });
            }
        },
        endActiveTimer() {
            if (this.warmUpEnded) {
                this.workoutSessionStore.endRestPeriod({
                    uuid: this.sessionSetUuid,
                });
            } else {
                this.workoutSessionStore.endWarmUp({
                    uuid: this.exercise.uuid,
                });
            }
        },
        async ensureExerciseHistoryAreLoaded() {
            // We must wait for the workout to be created on the server first.
            if (this.userIsLocalOnly || this.wasAddedOnTheFly) {
                return;
            }

            this.hasLoadedExerciseHistory =
                this.workoutSessionStore.hasLoadedExerciseHistory(
                    this.exercise.uuid,
                );

            if (!this.hasLoadedExerciseHistory) {
                await this.workoutSessionStore.fetchExerciseHistory(
                    this.exercise.uuid,
                );
                this.hasLoadedExerciseHistory = true;
            }
        },
    },
    watch: {
        sessionSetUuid() {
            this.ensureExerciseHistoryAreLoaded();
        },
        createdAt(value, oldValue) {
            if (value !== null && oldValue === null) {
                this.ensureExerciseHistoryAreLoaded();
            }
        },
    },
};
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
