<template>
    <component :elevation="this.$vuetify.breakpoint.smAndDown ? 0 : 5"
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
                    <VListItem @click="lookBehind" :disabled="isFirstSetOfWorkout">
                        <VListItemTitle>View previous</VListItemTitle>
                    </VListItem>
                    <VListItem @click="lookAhead" :disabled="isLastSetOfWorkout">
                        <VListItemTitle>View next</VListItemTitle>
                    </VListItem>
                    <VListItem @click="skipSet" :disabled="!isInProgressSet">
                        <VListItemTitle>Skip set</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </VToolbar>

        <VAlert
            v-if="!changingSet && !isInProgressSet"
            dense
            text
            type="info"
        >
            <template v-if="isLookingBack">This is a previous set.</template>
            <template v-else>This is an upcoming set.</template>
            <br/>
            <RouterLink
                :to="{ name: 'setOverview', params: { sessionSetUuid: this.inProgressSet.uuid }}"
            >
                Jump to current.
            </RouterLink>
        </VAlert>

        <VStepper
            v-else
            :value="set.position + 1"
            :vertical="false"
        >
            <VStepperHeader>
                <template v-for="(otherSet) in exercise.sessionSets">
                    <VStepperStep
                        :complete="otherSet.position < set.position"
                        :key="otherSet.uuid"
                        :step="otherSet.position + 1"
                    >
                        Set {{ otherSet.position + 1 }}
                    </VStepperStep>

                    <VDivider v-if="otherSet.position + 1 < exercise.sessionSets.length"/>
                </template>
            </VStepperHeader>
        </VStepper>

        <VCardText class="py-0">
            <VContainer class="py-0">
                <VRow>
                    <VCol class="pt-0" cols="6" md="6" sm="6">
                        <VTextField
                            class="mt-0"
                            autofocus
                            label="Weight (kg)"
                            type="number"
                            v-model="weight"
                        />
                    </VCol>
                    <VCol class="pt-0" cols="6" md="6" sm="6">
                        <VTextField
                            class="mt-0"
                            label="Reps"
                            type="number"
                            v-model="reps"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol class="pt-0" cols="12" md="12" sm="12" xs="6">
                        <RestPeriodSlider
                            v-if="restPeriodNotStarted"
                            v-model="restPeriod"
                        />
                        <VTextField
                            v-else
                            :value="restPeriodDisplay"
                            label="Rest period"
                            type="text"
                            disabled
                        />
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
                                <a href="#" @click="openLastTimeStats">
                                    View last time's stats
                                </a>

                                <SessionStatsModal
                                    v-if="showLastTimeStats"
                                    :session-exercise="lastTimeExercise"
                                    v-model="showLastTimeStats"
                                />
                            </template>
                            <span v-else>This is the first time you are doing this exercise.</span>
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
                <VRow justify="space-between" v-if="isInProgressSet && isDuringRestPeriod">
                    <VCol class="pt-0" cols="6">
                        <RestPeriodTimer
                            :session-set-uuid="sessionSetUuid"
                            label="Rest period remaining"
                        />
                    </VCol>

                    <VCol class="pt-0 text-right" cols="6">
                        <VBtn
                            :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                            @click="endRestPeriod"
                            class="mt-2"
                            :height="'75%'"
                            color="warning"
                            small
                            :disabled="changingSet"
                        >
                            <VIcon left>mdi-stop</VIcon>
                            End rest
                        </VBtn>
                    </VCol>
                </VRow>
                <VRow justify="space-between" v-else-if="isInProgressSet && restPeriodIsFinished">
                    <VCol class="pt-0" cols="6">
                        <RestPeriodTimer
                            :session-set-uuid="sessionSetUuid"
                            label="Rest period finished"
                        />
                    </VCol>

                    <VCol v-if="isInProgressSet" class="pt-0 text-right" cols="6">
                        <VBtn
                            v-if="isLastSetOfWorkout"
                            :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                            :height="'75%'"
                            @click="endWorkout"
                            class="mt-2"
                            color="success"
                            small
                            :loading="changingSet"
                        >
                            <VIcon left>mdi-check</VIcon>
                            Finish <br v-if="$vuetify.breakpoint.xsOnly"/> workout
                        </VBtn>
                        <VBtn
                            v-else
                            :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                            :height="'75%'"
                            @click="startNextSet"
                            class="mt-2"
                            color="success"
                            small
                            :loading="changingSet"
                        >
                            <VIcon left>mdi-play</VIcon>
                            Next set
                        </VBtn>
                    </VCol>
                </VRow>
            </VContainer>

            <VCardActions v-if="isInProgressSet && restPeriodNotStarted" class="justify-center" width="100%">
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
    import RestPeriodTimer from '../RestPeriodTimer';
    import {minsSecDuration} from '../../../dates';
    import SessionStatsModal from './SessionExerciseStatsModal';
    import ServerSyncInfo from './../../ServerSyncInfo';

    export default {
        components: {
            ServerSyncInfo,
            SessionStatsModal,
            RestPeriodSlider,
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

            this.ensureLastTimeStatsAreLoaded();
        },
        data() {
            return {
                hasLoadedLastTimeExercise: false,
                showLastTimeStats: false,
                changingSet: false,
            }
        },
        computed: {
            ...mapGetters('workoutSession', ['workoutName', 'uuid', 'lastTimeExercise', 'saveStatusMessage', 'updatedAt']),
            set() {
                return this.$store.getters['workoutSession/set'](this.sessionSetUuid);
            },
            isInProgressSet() {
                return this.set.uuid === this.inProgressSet?.uuid;
            },
            isLookingBack() {
                if (this.isInProgressSet) {
                    return false;
                }

                if (this.nextSet === null) {
                    return false;
                }

                return this.nextSet.startedAt !== null;
            },
            isLookingAhead() {
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
                    })
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
            async lookAhead() {
                await this.$router.push({ name: 'setOverview', params: { sessionSetUuid: this.nextSet.uuid }});
            },
            async lookBehind() {
                await this.$router.push({ name: 'setOverview', params: { sessionSetUuid: this.previousSet.uuid }});
            },
            async fetchLastTimeExercise() {
                return this.$store.dispatch('workoutSession/fetchLastTimeExercise', this.exercise.uuid);
            },
            async endWorkout() {
                this.changingSet = true;

                await this.$store.dispatch('workoutSession/endWorkout');
                await this.$router.push({ name: 'sessionOverview', params: { workoutSessionUuid: this.uuid }});

                this.changingSet = false;
            },
            skipSet() {
                this.startNextSet();
            },
            async startNextSet() {
                this.changingSet = true;

                if (this.set.endedAt === null) {
                    this.endSet();
                }

                await this.$store.dispatch('workoutSession/startSet', {
                    uuid: this.nextSet.uuid,
                })

                await this.$router.push({ name: 'setOverview', params: { sessionSetUuid: this.nextSet.uuid }});

                this.changingSet = false;
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
