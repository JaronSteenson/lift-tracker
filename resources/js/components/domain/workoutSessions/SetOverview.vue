<template>
    <component
        :elevation="$vuetify.breakpoint.smAndDown ? 0 : 5"
        :is="$vuetify.breakpoint.smAndDown ? 'div' : 'VCard'"
        class="js-workout-drag-handle workout-builder-card"
        max-width="960"
        width="100%"
    >
        <VToolbar>
            <VToolbarTitle>{{ exercise.name }} - set {{ set.position + 1 }}</VToolbarTitle>

            <VSpacer/>

            <ServerSyncInfo
                :status-message="saveStatusMessage"
                :updated-at="updatedAt"
            />

            <VMenu bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                    </VBtn>
                </template>

                <VList>
                    <VListItem :disabled="isFirstSetOfWorkout" @click="lookBack">
                        <VListItemTitle>View previous</VListItemTitle>
                    </VListItem>
                    <VListItem :disabled="isLastSetOfWorkout" @click="lookAhead">
                        <VListItemTitle>View next</VListItemTitle>
                    </VListItem>
                    <VListItem :disabled="!isInProgressSet || isLastSetOfWorkout" @click="skipSet">
                        <VListItemTitle>Skip set</VListItemTitle>
                    </VListItem>
                    <VListItem :disabled="!allowEndWorkout" @click="endWorkout">
                        <VListItemTitle>Finish workout</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </VToolbar>

        <VAlert
            dense
            text
            type="info"
            v-if="!isChangingSet && (isLookingAhead || isLookingBack)"
        >
            <template v-if="isLookingBack">This is a previous set.</template>
            <template v-else-if="isLookingAhead">This is an upcoming set.</template>
            <br/>
            <RouterLink
                :to="{ name: 'setOverview', params: { sessionSetUuid: inProgressSet.uuid }}"
            >
                Jump to current set
            </RouterLink>
        </VAlert>

        <VAlert
            dense
            text
            type="info"
            v-if="!isChangingSet && workoutIsFinished"
        >
            <template v-if="isOpenForEdits">
                Your are making retrospective edits to a workout.
                <br/>
                <a
                    @click="isOpenForEdits = false"
                    href="#"
                    v-if="isOpenForEdits"
                >
                    Stop editing
                </a>
            </template>
            <template v-else>
                You are viewing a finished workout.

                <br/>
                <a
                    @click="isOpenForEdits = true"
                    href="#"
                    v-if="!isOpenForEdits"
                >
                    Edit this set
                </a>
                <br/>
                <RouterLink
                    :to="{ name: 'sessionOverview', params: {workoutSessionUuid: uuid}}"
                    v-if="!isOpenForEdits"
                >
                    Go back to session overview
                </RouterLink>
            </template>
        </VAlert>

        <VStepper
            :value="set.position + 1"
            flat
            :vertical="false"
            @change="changeSetFromStepper($event)"
        >
            <VStepperHeader>
                <VIcon
                    v-if="canLookBack"
                    @click="lookBack"
                    class="set-navigation set-navigation--left"
                >
                    {{ $svgIcons.mdiChevronLeft }}
                </VIcon>

                <template v-for="otherSet in exercise.sessionSets">
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
                        v-if="otherSet.position + 1 < exercise.sessionSets.length"
                        :key="otherSet.position + '-divider'"
                    />
                </template>

                <VIcon
                    v-if="canLookAhead"
                    @click="lookAhead"
                    class="set-navigation set-navigation--right"
                >
                    {{ $svgIcons.mdiChevronRight }}
                </VIcon>
            </VStepperHeader>
        </VStepper>

        <VCardText class="py-0">
            <VContainer class="py-0">
                <VRow>
                    <VCol class="pt-0" cols="6" md="6" sm="6">
                        <VTextField
                            :disabled="!isOpenForEdits"
                            autofocus
                            class="mt-0"
                            label="Weight (kg)"
                            type="number"
                            v-model.number="weight"
                        />
                    </VCol>
                    <VCol class="pt-0" cols="6" md="6" sm="6">
                        <VTextField
                            :disabled="!isOpenForEdits"
                            class="mt-0"
                            label="Reps"
                            type="number"
                            v-model.number="reps"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol v-if="isInProgressWorkout" class="pt-0" cols="6">
                        <LabeledWorkoutDuration :workoutSession="workoutSession"/>
                    </VCol>
                    <VCol class="pt-0" cols="6">
                        <RestPeriodInput
                            v-if="!isLastSetOfExercise"
                            v-model="restPeriod"
                            :disabled="!isOpenForEdits || isDuringRestPeriod"
                        />
                    </VCol>
                </VRow>
                <VRow class="pt-0 mt-0">
                    <VCol class="pt-0 mt-0" cols="8">
                        <span v-if="!hasLoadedExercisePreviousEntries">
                            Loading previous entry overviews...
                            <VProgressLinear indeterminate/>
                        </span>
                        <template v-else>
                            <template v-if="exercisePreviousEntries.length > 0">
                                <a @click="openPreviousEntryOverviews" href="#">
                                    Previous entry overviews
                                </a>

                                <SessionExerciseStatsModal
                                    v-if="showPreviousEntryOverviews"
                                    v-model="showPreviousEntryOverviews"
                                    :session-exercises="[...exercisePreviousEntries, exercise]"
                                    :start-index="1"
                                />
                            </template>
                            <span v-else>This is the first time you are doing this exercise. Last time recaps will appear here next time.</span>
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
                <VRow justify="space-between" v-if="shouldShowRestPeriodActions">
                    <VCol class="pt-0" cols="6">
                        <RestPeriodTimer
                            :session-set-uuid="sessionSetUuid"
                            label="Rest period remaining"
                            overdue-label="Rest period overdue"
                        />
                    </VCol>

                    <VCol class="pt-0 text-right" cols="6">
                        <VBtn
                            :disabled="isChangingSet"
                            :height="'75%'"
                            :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                            @click="endRestPeriod"
                            class="mt-2"
                            color="warning"
                            small
                        >
                            <VIcon left>{{ $svgIcons.mdiStop }}</VIcon>
                            End rest
                        </VBtn>
                    </VCol>
                </VRow>
                <VRow justify="space-between" v-else-if="(isInProgressSet && restPeriodIsFinished) || (isLastSetOfWorkout && !workoutIsFinished) || isEndingWorkout">
                    <VCol v-if="!isLastSetOfExercise" class="pt-0" cols="6">
                        <RestPeriodTimer
                            :session-set-uuid="sessionSetUuid"
                            label="Rest period finished"
                        />
                    </VCol>

                    <template v-if="shouldShowFinishActions">
                        <VCol v-if="isLastSetOfExercise" class="pt-0" cols="6">
                            <div>
                                <p v-if="isLastSetOfWorkout">There is no rest period because this is the last set for this workout.</p>
                                <p v-else>There is no rest period because this is the last set for this exercise.</p>
                            </div>
                        </VCol>
                        <VCol v-if="isInProgressSet || isEndingWorkout" class="pt-0 text-right" cols="6">
                            <VBtn
                                v-if="isLastSetOfWorkout"
                                height="3rem"
                                :loading="isChangingSet"
                                :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                                @click="endWorkout"
                                class="mt-2"
                                color="success"
                                small
                            >
                                <VIcon left>{{ $svgIcons.mdiCheck }}</VIcon>
                                Finish <br v-if="$vuetify.breakpoint.xsOnly"/> workout
                            </VBtn>
                            <VBtn
                                v-else
                                height="3rem"
                                :loading="isChangingSet"
                                :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                                @click="startNextSet"
                                class="mt-2"
                                color="success"
                                small
                            >
                                <VIcon left>{{ $svgIcons.mdiPlay }}</VIcon>
                                Next set
                            </VBtn>
                        </VCol>
                    </template>
                </VRow>
            </VContainer>

            <VCardActions class="justify-center" v-if="isInProgressSet && restPeriodNotStarted && !isLastSetOfExercise" width="100%">
                <VBtn @click="startRestPeriod" class="start-rest-button" color="primary" x-large>
                    <VIcon left>{{ $svgIcons.mdiClockStart }}</VIcon>
                    Start rest period
                </VBtn>
            </VcardActions>
        </VCardText>
    </component>
</template>

<script>
import {mapGetters} from 'vuex';
import RestPeriodInput from '../RestPeriodInput';
import RestPeriodTimer from '../RestPeriodTimer';
import { minsSecDuration } from '../../../dates';
import SessionExerciseStatsModal from './SessionExerciseStatsModal';
import ServerSyncInfo from './../../ServerSyncInfo';
import LabeledWorkoutDuration from "../LabeledWorkoutDuration";

export default {
    components: {
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
        this.isOpenForEdits = this.workoutSession.endedAt === null;

        this.ensureExercisePreviousEntriesAreLoaded();
    },
    data() {
        return {
            hasLoadedExercisePreviousEntries: false,
            showPreviousEntryOverviews: false,
            isChangingSet: false,
            isEndingWorkout: false,
            isOpenForEdits: true,
        }
    },
    computed: {
        ...mapGetters('workoutSession', [
            'workoutName',
            'workoutSession',
            'uuid',
            'saveStatusMessage',
            'updatedAt'
        ]),
        set() {
            return this.$store.getters['workoutSession/set'](this.sessionSetUuid);
        },
        isInProgressSet() {
            return this.set.uuid === this.inProgressSet?.uuid;
        },
        isInProgressWorkout() {
            return this.$store.getters['workoutSession/isInProgressWorkout'](this.workoutSession.uuid);
        },
        workoutIsFinished() {
            return this.workoutSession.endedAt !== null;
        },
        shouldShowFinishActions() {
            return this.isInProgressSet || this.isEndingWorkout || this.isLastSetOfExercise;
        },
        shouldShowRestPeriodActions() {
            return this.isInProgressSet && this.isDuringRestPeriod && !this.isLastSetOfExercise;
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
            return this.$store.getters['workoutSession/previousSet'](this.sessionSetUuid);
        },
        nextSet() {
            return this.$store.getters['workoutSession/nextSet'](this.sessionSetUuid);
        },
        inProgressSet() {
            return this.$store.getters['workoutSession/currentSetForInProgressWorkout'](this.uuid);
        },
        exercise() {
            return this.$store.getters['workoutSession/exerciseBySet'](this.sessionSetUuid);
        },
        restPeriodNotStarted() {
            return this.$store.getters['workoutSession/restPeriodNotStarted'](this.sessionSetUuid);
        },
        isDuringRestPeriod() {
            return this.$store.getters['workoutSession/isDuringRestPeriod'](this.sessionSetUuid);
        },
        restPeriodIsFinished() {
            if (this.isLastSetOfExercise) {
                return true;
            }

            return this.$store.getters['workoutSession/restPeriodIsFinished'](this.sessionSetUuid);
        },
        isFirstSetOfWorkout() {
            return this.$store.getters['workoutSession/isFirstSetOfWorkout'](this.sessionSetUuid);
        },
        isLastSetOfWorkout() {
            return this.$store.getters['workoutSession/isLastSetOfWorkout'](this.sessionSetUuid);
        },
        isLastSetOfExercise() {
            return this.$store.getters['workoutSession/isLastSetOfExercise'](this.sessionSetUuid);
        },
        exercisePreviousEntries() {
            return this.$store.getters['workoutSession/exercisePreviousEntries'](this.exercise.uuid);
        },
        weight: {
            get() {
                return this.$store.getters['workoutSession/weightForCurrentSet'](this.sessionSetUuid);
            },
            set(weight) {
                this.$store.dispatch('workoutSession/updateSetWeight', {
                    uuid: this.sessionSetUuid,
                    weight
                })
            },
        },
        reps: {
            get() {
                return this.$store.getters['workoutSession/repsForCurrentSet'](this.sessionSetUuid);
            },
            set(reps) {
                this.$store.dispatch('workoutSession/updateSetReps', {
                    uuid: this.sessionSetUuid,
                    reps
                })
            },
        },
        restPeriod: {
            get() {
                return this.$store.getters['workoutSession/restPeriodForCurrentSet'](this.sessionSetUuid);
            },
            set(restPeriodDuration) {
                this.$store.dispatch('workoutSession/updateSetRestPeriodDuration', {
                    uuid: this.sessionSetUuid,
                    restPeriodDuration
                });
            },
        },
        exerciseNotes: {
            get() {
                return this.exercise.notes;
            },
            set(notes) {
                this.$store.dispatch('workoutSession/updateExerciseNotes', {
                    uuid: this.exercise.uuid,
                    notes
                })
            },
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

            this.$router.push({name: 'setOverview', params: {sessionSetUuid: setToChangeTo.uuid}});
        },
        async lookAhead() {
            await this.$router.push({name: 'setOverview', params: {sessionSetUuid: this.nextSet.uuid}});
        },
        async lookBack() {
            await this.$router.push({name: 'setOverview', params: {sessionSetUuid: this.previousSet.uuid}});
        },
        async fetchExercisePreviousEntries() {
            return this.$store.dispatch('workoutSession/fetchExercisePreviousEntries', this.exercise.uuid);
        },
        async endWorkout() {
            this.isEndingWorkout = true;
            this.isChangingSet = true;

            await this.$store.dispatch('workoutSession/endWorkout');
            await this.$router.push({name: 'sessionOverview', params: {workoutSessionUuid: this.uuid}});

            this.isChangingSet = false;
            this.isEndingWorkout = false;
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

            await this.$router.push({name: 'setOverview', params: {sessionSetUuid: nextSetUuid}});

            await this.$store.dispatch('workoutSession/startSet', {
                uuid: nextSetUuid,
            });

            this.isChangingSet = false;
        },
        startRestPeriod() {
            this.$store.dispatch('workoutSession/startRestPeriod', {
                uuid: this.sessionSetUuid,
            })
        },
        endRestPeriod() {
            this.$store.dispatch('workoutSession/endRestPeriod', {
                uuid: this.sessionSetUuid,
            })
        },
        endSet() {
            this.$store.dispatch('workoutSession/endSet', {
                uuid: this.sessionSetUuid,
            })
        },
        async ensureExercisePreviousEntriesAreLoaded() {
            this.hasLoadedExercisePreviousEntries = this.$store.getters['workoutSession/hasLoadedExercisePreviousEntries'](this.exercise.uuid);
            if (!this.hasLoadedExercisePreviousEntries) {
                await this.fetchExercisePreviousEntries();
                this.hasLoadedExercisePreviousEntries = true;
            }
        },
        openPreviousEntryOverviews() {
            this.showPreviousEntryOverviews = true;
        },
    },
    watch: {
        sessionSetUuid() {
            this.ensureExercisePreviousEntriesAreLoaded();
        }
    }
}
</script>

<style lang="scss" scoped>
.v-stepper {
    margin-top: 5px;
    box-shadow: none;
}

.v-stepper__header {
    box-shadow: none;
}

.start-rest-button {
    margin-bottom: 15px;
}

.set-navigation {
    // Prevent focus/loss of focus background.
    &:after  {
        background: none !important;
    }

    &--left {
        margin-left: 15px;
    }

    &--right {
        margin-right: 15px;
    }
}
</style>
