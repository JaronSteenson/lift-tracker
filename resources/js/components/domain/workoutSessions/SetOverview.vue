<template>
    <component
        :elevation="this.$vuetify.breakpoint.smAndDown ? 0 : 5"
        :is="this.$vuetify.breakpoint.smAndDown ? 'div' : 'VCard'"
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
                        <VIcon>mdi-dots-vertical</VIcon>
                    </VBtn>
                </template>

                <VList>
                    <VListItem :disabled="isFirstSetOfWorkout" @click="lookBehind">
                        <VListItemTitle>View previous</VListItemTitle>
                    </VListItem>
                    <VListItem :disabled="isLastSetOfWorkout" @click="lookAhead">
                        <VListItemTitle>View next</VListItemTitle>
                    </VListItem>
                    <VListItem :disabled="!isInProgressSet" @click="skipSet">
                        <VListItemTitle>Skip set</VListItemTitle>
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
                :to="{ name: 'setOverview', params: { sessionSetUuid: this.inProgressSet.uuid }}"
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
                    :to="{ name: 'sessionOverview', params: {workoutSessionUuid: this.uuid}}"
                    v-if="!isOpenForEdits"
                >
                    Go back to session overview
                </RouterLink>
            </template>
        </VAlert>

        <VStepper
            v-touch:swipe="handleSwipe"
            :value="set.position + 1"
            :vertical="false"
        >
            <VStepperHeader>
                <template v-for="otherSet in exercise.sessionSets">
                    <VStepperStep
                        :complete="otherSet.endedAt !== null"
                        :color="otherSet.position !== set.position ? 'grey' : 'primary'"
                        :key="otherSet.uuid"
                        :step="otherSet.position + 1"
                    >
                        Set {{ otherSet.position + 1 }}
                    </VStepperStep>

                    <VDivider v-if="otherSet.position + 1 < exercise.sessionSets.length"/>
                </template>
            </VStepperHeader>
        </VStepper>

        <VCardText class="py-0" v-touch:swipe="handleSwipe">
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
                    <VCol v-if="!isLastSetOfExercise" class="pt-0" cols="12" md="6" sm="6" xs="6">
                        <template>
                            <RestPeriodSlider
                                v-if="restPeriodNotStarted && !workoutIsFinished"
                                v-model="restPeriod"
                            />
                            <RestPeriodInput
                                v-else
                                v-model="restPeriod"
                                :disabled="!isOpenForEdits"
                            />
                        </template>
                    </VCol>
                </VRow>
                <VRow class="pt-0 mt-0">
                    <VCol class="pt-0 mt-0" cols="12">
                        <span v-if="!hasLoadedLastTimeExercise">
                            Loading last times stats...
                            <VProgressLinear indeterminate/>
                        </span>
                        <template v-else>
                            <template v-if="lastTimeExercise">
                                <a @click="openLastTimeStats" href="#">
                                    View last time's stats
                                </a>

                                <SessionStatsModal
                                    :session-exercise="lastTimeExercise"
                                    v-if="showLastTimeStats"
                                    v-model="showLastTimeStats"
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
                <VRow justify="space-between" v-if="isInProgressSet && isDuringRestPeriod && !isLastSetOfExercise">
                    <VCol class="pt-0" cols="6">
                        <RestPeriodTimer
                            :session-set-uuid="sessionSetUuid"
                            label="Rest period remaining"
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
                            <VIcon left>mdi-stop</VIcon>
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

                    <template v-if="isInProgressSet || isEndingWorkout || isLastSetOfExercise">
                        <VCol v-if="isLastSetOfExercise" class="pt-0" cols="6">
                            <div>
                                <p v-if="isLastSetOfWorkout">There is no rest period because this is the last set for this workout.</p>
                                <p v-else>There is no rest period because this is the last set for this exercise.</p>
                            </div>
                        </VCol>
                        <VCol class="pt-0 text-right" cols="6">
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
                                <VIcon left>mdi-check</VIcon>
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
                                <VIcon left>mdi-play</VIcon>
                                Next set
                            </VBtn>
                        </VCol>
                    </template>
                </VRow>
            </VContainer>

            <VCardActions class="justify-center" v-if="isInProgressSet && restPeriodNotStarted && !isLastSetOfExercise" width="100%">
                <VBtn @click="startRestPeriod" class="start-rest-button" color="primary" x-large>
                    <VIcon left>mdi-clock-start</VIcon>
                    Start rest period
                </VBtn>
            </VcardActions>
        </VCardText>
    </component>
</template>

<script>
import {mapGetters} from 'vuex';
import RestPeriodSlider from '../RestPeriodSlider';
import RestPeriodInput from '../RestPeriodInput';
import RestPeriodTimer from '../RestPeriodTimer';
import {minsSecDuration} from '../../../dates';
import SessionStatsModal from './SessionExerciseStatsModal';
import ServerSyncInfo from './../../ServerSyncInfo';

export default {
    components: {
        ServerSyncInfo,
        SessionStatsModal,
        RestPeriodSlider,
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
        if (this.isDuringRestPeriod) {
            this.resumeRestPeriod();
        }

        this.isOpenForEdits = this.workoutSession.endedAt === null;

        this.ensureLastTimeStatsAreLoaded();
    },
    data() {
        return {
            hasLoadedLastTimeExercise: false,
            showLastTimeStats: false,
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
            'lastTimeExercise',
            'saveStatusMessage',
            'updatedAt'
        ]),
        set() {
            return this.$store.getters['workoutSession/set'](this.sessionSetUuid);
        },
        isInProgressSet() {
            return this.set.uuid === this.inProgressSet?.uuid;
        },
        workoutIsFinished() {
            return this.workoutSession.endedAt !== null;
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
        lastTimeExercise() {
            return this.$store.getters['workoutSession/lastTimeExercise'](this.exercise.uuid);
        },
        restPeriodDisplay() {
            return minsSecDuration(this.restPeriod);
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
        handleSwipe(eventName) {
            if (eventName === 'swiperight' && !this.isFirstSetOfWorkout) {
                this.lookBehind();
                return;
            }

            if (eventName === 'swipeleft' && !this.isLastSetOfWorkout) {
                this.lookAhead();
                return;
            }
        },
        canLookAhead() {
            return this.isLastSetOfWorkout;
        },
        async lookAhead() {
            await this.$router.push({name: 'setOverview', params: {sessionSetUuid: this.nextSet.uuid}});
        },
        async lookBehind() {
            await this.$router.push({name: 'setOverview', params: {sessionSetUuid: this.previousSet.uuid}});
        },
        async fetchLastTimeExercise() {
            return this.$store.dispatch('workoutSession/fetchLastTimeExercise', this.exercise.uuid);
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
        resumeRestPeriod() {
            this.$store.dispatch('workoutSession/startRestPeriodTimeout', {
                uuid: this.sessionSetUuid,
            })
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
        async ensureLastTimeStatsAreLoaded() {
            this.hasLoadedLastTimeExercise = this.$store.getters['workoutSession/hasLoadedLastTimeExercise'](this.exercise.uuid);
            if (!this.hasLoadedLastTimeExercise) {
                await this.fetchLastTimeExercise();
                this.hasLoadedLastTimeExercise = true;
            }
        },
        openLastTimeStats() {
            this.showLastTimeStats = true;
        },
    },
    watch: {
        sessionSetUuid() {
            this.ensureLastTimeStatsAreLoaded();
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
</style>
