<template>
    <div>
        <PageToolbar
            :title="pageTitle"
            :back-to="{
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: uuid },
            }"
        >
            <template v-slot:right>
                <ServerSyncInfo :status="saveStatus" :updated-at="updatedAt" />

                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
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
                            :disabled="!isInProgressSet || isLastSetOfWorkout"
                            @click="skipSet"
                        >
                            <VListItemTitle>Skip set</VListItemTitle>
                        </VListItem>
                        <VListItem
                            :disabled="!allowEndWorkout"
                            @click="endWorkout"
                        >
                            <VListItemTitle>Finish workout</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </PageToolbar>

        <NarrowContentContainer use-full-width>
            <VAlert
                dense
                text
                type="info"
                v-if="!isChangingSet && (isLookingAhead || isLookingBack)"
            >
                <div class="d-flex justify-space-between align-center">
                    <span v-if="isLookingBack">This is a previous set.</span>
                    <span v-else-if="isLookingAhead">
                        This is an upcoming set.
                    </span>
                    <VBtn
                        class="ml-5"
                        small
                        color="green"
                        :to="{
                            name: 'SetOverviewPage',
                            params: { sessionSetUuid: inProgressSet.uuid },
                        }"
                    >
                        <VIcon>{{ $svgIcons.mdiPlay }}</VIcon>
                        Resume
                        <template v-if="$vuetify.breakpoint.smAndUp">
                            current</template
                        >
                    </VBtn>
                </div>
            </VAlert>

            <VAlert
                dense
                text
                type="info"
                v-if="!isChangingSet && workoutIsFinished"
            >
                <div class="d-flex justify-space-between align-center">
                    <template v-if="isOpenForEdits">
                        <span class="px-2">
                            Your are making retrospective edits to a workout.
                        </span>
                        <VBtn
                            @click="isOpenForEdits = false"
                            color="red"
                            v-if="isOpenForEdits"
                        >
                            Stop editing
                        </VBtn>
                    </template>
                    <template v-else>
                        <span class="px-2">
                            You are viewing a finished workout.
                        </span>
                        <VBtn
                            @click="isOpenForEdits = true"
                            color="primary"
                            v-if="!isOpenForEdits"
                        >
                            Edit
                        </VBtn>
                    </template>
                </div>
            </VAlert>

            <VStepper
                :value="set.position + 1"
                flat
                :vertical="false"
                @change="changeSetFromStepper($event)"
            >
                <VStepperHeader>
                    <RouterLink
                        v-if="hasPrevousExercise"
                        class="d-flex"
                        :to="{
                            name: 'SetOverviewPage',
                            params: { sessionSetUuid: this.previousSet.uuid },
                        }"
                    >
                        <VIcon
                            class="set-navigation set-navigation--left"
                            large
                            color="secondary-darken1"
                        >
                            {{ $svgIcons.mdiChevronLeft }}
                        </VIcon>
                    </RouterLink>
                    <div v-else class="d-flex">
                        <VIcon
                            class="set-navigation set-navigation--left set-navigation--disabled"
                            large
                        >
                            {{ $svgIcons.mdiChevronLeft }}
                        </VIcon>
                    </div>

                    <div class="d-flex justify-space-around flex-grow-1">
                        <template v-for="otherSet in setsForStepper">
                            <VStepperStep
                                :key="otherSet.position"
                                :complete="otherSet.endedAt !== null"
                                :color="getStepColor(otherSet)"
                                :step="otherSet.position + 1"
                                :editable="set.uuid !== otherSet.uuid"
                                :edit-icon="$svgIcons.mdiCheck"
                            >
                                Set {{ otherSet.position + 1 }}
                            </VStepperStep>

                            <VDivider
                                v-if="
                                    otherSet.position + 1 <
                                    exercise.sessionSets.length
                                "
                                :key="otherSet.position + '-divider'"
                            />
                        </template>
                    </div>

                    <RouterLink
                        v-if="canLookAhead"
                        class="d-flex"
                        :to="{
                            name: 'SetOverviewPage',
                            params: { sessionSetUuid: this.nextSet.uuid },
                        }"
                    >
                        <VIcon
                            class="set-navigation set-navigation--right"
                            large
                        >
                            {{ $svgIcons.mdiChevronRight }}
                        </VIcon>
                    </RouterLink>
                    <div v-else class="d-flex">
                        <VIcon
                            class="set-navigation set-navigation--right set-navigation--disabled"
                            large
                        >
                            {{ $svgIcons.mdiChevronRight }}
                        </VIcon>
                    </div>
                </VStepperHeader>
            </VStepper>

            <VCardText class="px-0">
                <VContainer class="py-0">
                    <VRow>
                        <VCol class="pt-0" cols="6" md="6" sm="6">
                            <VTextField
                                :disabled="!isOpenForEdits"
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
                                :disabled="!isOpenForEdits"
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
                            <RestPeriodInput
                                v-if="!isLastSetOfExercise"
                                v-model="restPeriod"
                                :disabled="
                                    !isOpenForEdits || isDuringRestPeriod
                                "
                            />
                        </VCol>
                    </VRow>
                    <VRow v-if="!wasAddedOnTheFly" class="pt-0 mt-0">
                        <VCol class="pt-0 mt-0" cols="12" sm="6">
                            <span v-if="!hasLoadedExercisePreviousEntries">
                                Loading previous entry overviews...
                                <VProgressLinear indeterminate />
                            </span>
                            <template v-else>
                                <template
                                    v-if="exercisePreviousEntries.length > 0"
                                >
                                    <RouterLink
                                        :to="{
                                            $route,
                                            ...{
                                                query: { 'stats-open': true },
                                            },
                                        }"
                                    >
                                        Previous entry overviews
                                    </RouterLink>

                                    <SessionExerciseStatsModal
                                        url-search-param="stats-open"
                                        :session-exercises="[
                                            ...exercisePreviousEntries,
                                            exercise,
                                        ]"
                                        :start-index="1"
                                    />
                                </template>
                                <span v-else>
                                    This is the first time you are doing this
                                    exercise. Last time recaps will appear here
                                    next time.
                                </span>
                            </template>
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol class="pt-0" cols="12">
                            <VTextarea
                                :disabled="!isOpenForEdits"
                                auto-grow
                                filled
                                label="Notes"
                                v-model="exerciseNotes"
                            />
                        </VCol>
                    </VRow>
                    <VRow
                        alight="center"
                        justify="space-between"
                        v-if="shouldShowRestPeriodActions"
                    >
                        <VCol
                            class="pt-0"
                            :class="{ 'mt-2': $vuetify.breakpoint.xsOnly }"
                            cols="6"
                        >
                            <RestPeriodTimer
                                :session-set-uuid="sessionSetUuid"
                                label="Rest period remaining"
                                overdue-label="Rest period overdue"
                            />
                        </VCol>

                        <VCol class="pt-0 text-right" cols="6">
                            <VBtn
                                :height="$vuetify.breakpoint.xs ? '4rem' : null"
                                large
                                :disabled="isChangingSet"
                                :width="
                                    $vuetify.breakpoint.xsOnly ? '100%' : null
                                "
                                @click="endRestPeriod"
                                class="mt-2"
                                color="error"
                            >
                                <VIcon left>{{ $svgIcons.mdiStop }}</VIcon>
                                End rest
                            </VBtn>
                        </VCol>
                    </VRow>
                    <VRow
                        justify="space-between"
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
                                    :height="
                                        $vuetify.breakpoint.xs ? '4rem' : null
                                    "
                                    large
                                    :ripple="false"
                                    :loading="isEndingWorkout"
                                    :width="
                                        $vuetify.breakpoint.xsOnly
                                            ? '100%'
                                            : null
                                    "
                                    @click="endWorkout"
                                    class="mt-2"
                                    color="success"
                                >
                                    <VIcon left>{{ $svgIcons.mdiCheck }}</VIcon>
                                    Finish
                                    <br v-if="$vuetify.breakpoint.xsOnly" />
                                    workout
                                </VBtn>
                                <VBtn
                                    v-else
                                    :height="
                                        $vuetify.breakpoint.xs ? '4rem' : null
                                    "
                                    large
                                    :loading="isChangingSet"
                                    :width="
                                        $vuetify.breakpoint.xsOnly
                                            ? '100%'
                                            : null
                                    "
                                    @click="startNextSet"
                                    class="mt-2"
                                    color="success"
                                >
                                    <VIcon left>{{ $svgIcons.mdiPlay }}</VIcon>
                                    Next set
                                </VBtn>
                            </VCol>
                        </template>
                    </VRow>
                </VContainer>

                <VCardActions
                    class="justify-center"
                    v-if="
                        isInProgressSet &&
                        restPeriodNotStarted &&
                        !isLastSetOfExercise
                    "
                    width="100%"
                >
                    <VBtn
                        :height="$vuetify.breakpoint.xs ? '4rem' : null"
                        large
                        @click="startRestPeriod"
                        class="start-rest-button"
                        color="primary"
                    >
                        <VIcon left>{{ $svgIcons.restPeriodStart }}</VIcon>
                        Start rest period
                    </VBtn>
                </VCardActions>
            </VCardText>
        </NarrowContentContainer>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import RestPeriodInput from '../RestPeriodInput';
import RestPeriodTimer from '../RestPeriodTimer';
import SessionExerciseStatsModal from './SessionExerciseStatsModal';
import ServerSyncInfo from './../../ServerSyncInfo';
import LabeledWorkoutDuration from '../LabeledWorkoutDuration';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import PageToolbar from '../../AppBar';

export default {
    components: {
        PageToolbar,
        NarrowContentContainer,
        LabeledWorkoutDuration,
        ServerSyncInfo,
        SessionExerciseStatsModal,
        RestPeriodInput,
        RestPeriodTimer,
    },
    props: {
        sessionSetUuid: {
            type: String,
            required: true,
        },
    },
    created() {
        this.ensureExercisePreviousEntriesAreLoaded();
    },
    data() {
        return {
            hasLoadedExercisePreviousEntries: false,
            isChangingSet: false,
            isEndingWorkout: false,
        };
    },
    computed: {
        ...mapState('workoutSession', ['saveStatus']),
        ...mapGetters('workoutSession', [
            'workoutName',
            'workoutSession',
            'uuid',
            'updatedAt',
        ]),
        pageTitle() {
            if (this.$vuetify.breakpoint.xsOnly) {
                return this.exercise.name;
            }

            return `${this.exercise.name} - set ${this.set.position + 1}`;
        },
        set() {
            return this.$store.getters['workoutSession/set'](
                this.sessionSetUuid
            );
        },
        isInProgressSet() {
            return this.set.uuid === this.inProgressSet?.uuid;
        },
        isInProgressWorkout() {
            return this.$store.getters['workoutSession/isInProgressWorkout'](
                this.workoutSession.uuid
            );
        },
        isOpenForEdits: {
            get() {
                return this.$store.getters['workoutSession/isOpenForEdits'](
                    this.workoutSession.uuid
                );
            },
            set(value) {
                this.$store.dispatch(
                    'workoutSession/updateOpenForEditsStatus',
                    {
                        workoutSessionUuid: this.workoutSession.uuid,
                        value,
                    }
                );
            },
        },
        workoutIsFinished() {
            return this.workoutSession.endedAt !== null;
        },
        shouldShowFinishActions() {
            return (
                this.isInProgressSet ||
                this.isEndingWorkout ||
                this.isLastSetOfExercise
            );
        },
        shouldShowRestPeriodActions() {
            return (
                this.isInProgressSet &&
                this.isDuringRestPeriod &&
                !this.isLastSetOfExercise
            );
        },
        allowEndWorkout() {
            return this.isInProgressSet && this.isLastSetOfWorkout;
        },
        canLookAhead() {
            return !this.isLastSetOfWorkout;
        },
        canLookBack() {
            return !this.isFirstSetOfWorkout;
        },
        isLookingBack() {
            if (this.workoutIsFinished) {
                return false;
            }

            if (this.isInProgressSet) {
                return false;
            }

            if (this.nextSet === null) {
                return false;
            }

            return this.nextSet.startedAt !== null;
        },
        isLookingAhead() {
            if (this.workoutIsFinished) {
                return false;
            }

            if (this.set.startedAt !== null) {
                return false;
            }

            return !this.isInProgressSet && !this.isLookingBack;
        },
        previousSet() {
            return this.$store.getters['workoutSession/previousSet'](
                this.sessionSetUuid
            );
        },
        nextSet() {
            return this.$store.getters['workoutSession/nextSet'](
                this.sessionSetUuid
            );
        },
        inProgressSet() {
            return this.$store.getters[
                'workoutSession/currentSetForInProgressWorkout'
            ](this.uuid);
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
                return this.exercise.sessionSets;
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
            return this.$store.getters['workoutSession/exerciseBySet'](
                this.sessionSetUuid
            );
        },
        restPeriodNotStarted() {
            return this.$store.getters['workoutSession/restPeriodNotStarted'](
                this.sessionSetUuid
            );
        },
        isDuringRestPeriod() {
            return this.$store.getters['workoutSession/isDuringRestPeriod'](
                this.sessionSetUuid
            );
        },
        restPeriodIsFinished() {
            if (this.isLastSetOfExercise) {
                return true;
            }

            return this.$store.getters['workoutSession/restPeriodIsFinished'](
                this.sessionSetUuid
            );
        },
        isFirstSetOfWorkout() {
            return this.$store.getters['workoutSession/isFirstSetOfWorkout'](
                this.sessionSetUuid
            );
        },
        isLastSetOfWorkout() {
            return this.$store.getters['workoutSession/isLastSetOfWorkout'](
                this.sessionSetUuid
            );
        },
        isLastSetOfExercise() {
            return this.$store.getters['workoutSession/isLastSetOfExercise'](
                this.sessionSetUuid
            );
        },
        exercisePreviousEntries() {
            return this.$store.getters[
                'workoutSession/exercisePreviousEntries'
            ](this.exercise.uuid);
        },
        weight: {
            get() {
                return this.$store.getters[
                    'workoutSession/weightForCurrentSet'
                ](this.sessionSetUuid);
            },
            set(weight) {
                this.$store.dispatch('workoutSession/updateSetWeight', {
                    uuid: this.sessionSetUuid,
                    weight,
                });
            },
        },
        reps: {
            get() {
                return this.$store.getters['workoutSession/repsForCurrentSet'](
                    this.sessionSetUuid
                );
            },
            set(reps) {
                this.$store.dispatch('workoutSession/updateSetReps', {
                    uuid: this.sessionSetUuid,
                    reps,
                });
            },
        },
        restPeriod: {
            get() {
                return this.$store.getters[
                    'workoutSession/restPeriodForCurrentSet'
                ](this.sessionSetUuid);
            },
            set(restPeriodDuration) {
                this.$store.dispatch(
                    'workoutSession/updateSetRestPeriodDuration',
                    {
                        uuid: this.sessionSetUuid,
                        restPeriodDuration,
                    }
                );
            },
        },
        exerciseNotes: {
            get() {
                return this.exercise.notes;
            },
            set(notes) {
                this.$store.dispatch('workoutSession/updateExerciseNotes', {
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
        async fetchExercisePreviousEntries() {
            return this.$store.dispatch(
                'workoutSession/fetchExercisePreviousEntries',
                this.exercise.uuid
            );
        },
        endWorkout() {
            this.isEndingWorkout = true;
            this.isChangingSet = true;

            // Force a delay, so we show the loading feedback before the app get too busy to re-render the ui.
            this.$store.dispatch('workoutSession/endWorkout');
            this.$router.push({
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: this.uuid },
            });
        },
        skipSet() {
            this.startNextSet();
        },
        async startNextSet() {
            this.isChangingSet = true;

            if (this.set.endedAt === null) {
                this.endSet();
            }

            const nextSetUuid = this.nextSet.uuid;

            await this.$store.dispatch('workoutSession/startSet', {
                uuid: nextSetUuid,
            });

            await this.$router.push({
                name: 'SetOverviewPage',
                params: { sessionSetUuid: nextSetUuid },
            });

            this.isChangingSet = false;
        },
        startRestPeriod() {
            this.$store.dispatch('workoutSession/startRestPeriod', {
                uuid: this.sessionSetUuid,
            });
        },
        endRestPeriod() {
            this.$store.dispatch('workoutSession/endRestPeriod', {
                uuid: this.sessionSetUuid,
            });
        },
        endSet() {
            this.$store.dispatch('workoutSession/endSet', {
                uuid: this.sessionSetUuid,
            });
        },
        async ensureExercisePreviousEntriesAreLoaded() {
            if (this.wasAddedOnTheFly) {
                this.hasLoadedExercisePreviousEntries = true;
                return;
            }

            // We must wait for the workout to be created on the server first.
            if (this.createdAt === null) {
                return;
            }

            this.hasLoadedExercisePreviousEntries = this.$store.getters[
                'workoutSession/hasLoadedExercisePreviousEntries'
            ](this.exercise.uuid);

            if (!this.hasLoadedExercisePreviousEntries) {
                await this.fetchExercisePreviousEntries();
                this.hasLoadedExercisePreviousEntries = true;
            }
        },
    },
    watch: {
        sessionSetUuid() {
            this.ensureExercisePreviousEntriesAreLoaded();
        },
        createdAt(value, oldValue) {
            if (value !== null && oldValue === null) {
                this.ensureExercisePreviousEntriesAreLoaded();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.v-stepper {
    margin-top: 5px;
    box-shadow: none;
    max-width: 100vw;
    overflow-x: hidden;
    overflow-y: hidden;
}

.v-stepper__header {
    height: 40px;
    box-shadow: none;
    flex-wrap: nowrap;
}

.v-stepper__step {
    padding-top: 0;
    padding-bottom: 0;
}

.start-rest-button {
    margin-bottom: 15px;
}

.set-navigation {
    // Prevent focus/loss of focus background.
    &:after {
        background: none !important;
    }

    &--left {
        margin-left: 15px;
    }

    &--right {
        margin-right: 15px;
    }

    &--disabled {
        color: var(--v-secondary-darken1) !important;
    }
}
</style>
