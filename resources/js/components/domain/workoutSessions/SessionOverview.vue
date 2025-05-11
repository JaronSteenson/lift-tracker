<template>
    <div>
        <AppBar title="Session overview" :back-to="{ name: 'HomePage' }">
            <template v-slot:right>
                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :disabled="workoutSession.startedAt === null"
                            @click="showDeleteConfirmation"
                        >
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </AppBar>

        <NarrowContentContainer>
            <VAlert v-if="isInProgress" dense text type="info">
                <div class="d-flex justify-space-between align-center">
                    <span>This workout is still in progress.</span>
                    <VBtn
                        class="ml-5"
                        small
                        color="green"
                        :to="{
                            name: 'SetOverviewPage',
                            params: { sessionSetUuid: currentSet.uuid },
                        }"
                    >
                        Resume
                        <VIcon>{{ $svgIcons.mdiPlayPause }}</VIcon>
                    </VBtn>
                </div>
            </VAlert>

            <SessionStatsCard
                :workout-session="workoutSession"
                :time-stats="timeStats"
            />

            <VTimeline :dense="$vuetify.breakpoint.xsOnly">
                <VTimelineItem
                    v-for="(sessionExercise, i) in exercises"
                    :key="sessionExercise.uuid"
                    :icon="i === 0 ? $svgIcons.mdiPlay : undefined"
                    :fill-dot="i === 0"
                >
                    <template v-slot:opposite>
                        <div :class="`pt-1 font-weight-bold text--primary`">
                            +{{ sessionExercise.duration }}
                        </div>
                        <div>{{ sessionExercise.startedAt }}</div>
                    </template>
                    <ExerciseSummaryCard :exercise="sessionExercise" />
                </VTimelineItem>
                <VTimelineItem :icon="$svgIcons.mdiStop" fill-dot>
                    <template v-slot:opposite>
                        <div :class="`pt-1 font-weight-bold text--primary`">
                            +{{ workoutDuration }}
                        </div>
                        <div>{{ workoutEndedAt }}</div>
                    </template>
                    <VCard v-if="$vuetify.breakpoint.xsOnly">
                        <VCardSubtitle>
                            <span
                                :class="`pt-1 font-weight-bold text--primary`"
                            >
                                +{{ workoutDuration }},
                            </span>
                            <span>{{ workoutEndedAt }}</span>
                        </VCardSubtitle>
                    </VCard>
                </VTimelineItem>
            </VTimeline>
        </NarrowContentContainer>
    </div>
</template>

<script>
import SessionStatsCard from './SessionStatsCard';
import { mapGetters } from 'vuex';
import ExerciseSummaryCard from './ExerciseSummaryCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import {
    hoursMinutesSecondsDuration,
    hoursMinutesSecondsFromStartEnd,
    minsSecDuration,
    timeDescription,
} from '../../../dates';

export default {
    components: {
        NarrowContentContainer,
        AppBar,
        SessionStatsCard,
        ExerciseSummaryCard,
    },
    props: {
        originRoutineUuid: String,
        workoutSessionUuid: String,
    },
    computed: {
        ...mapGetters('workoutSession', [
            'workoutName',
            'workoutSession',
            'notSkippedSessionExercises',
            'timeStats',
        ]),
        exercises() {
            return this.notSkippedSessionExercises.map((exercise, i) => ({
                ...exercise,
                startedAt: timeDescription(exercise.sessionSets[0].startedAt),
                duration:
                    i === 0
                        ? minsSecDuration(0, true)
                        : hoursMinutesSecondsFromStartEnd(
                              this.workoutSession.startedAt,
                              exercise.sessionSets[0].startedAt
                          ),
            }));
        },
        isInProgress() {
            return this.$store.getters['workoutSession/isInProgressWorkout'](
                this.workoutSession.uuid
            );
        },
        currentSet() {
            return this.$store.getters[
                'workoutSession/currentSetForInProgressWorkout'
            ](this.workoutSession.uuid);
        },
        workoutDuration() {
            return hoursMinutesSecondsDuration(this.timeStats.total);
        },
        workoutEndedAt() {
            if (!this.workoutSession.endedAt) {
                return undefined;
            }

            return timeDescription(this.workoutSession.endedAt);
        },
    },
    methods: {
        showDeleteConfirmation() {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this workout?'
            );

            if (deleteConfirmed) {
                this.$store.dispatch(
                    'workoutSession/delete',
                    this.workoutSession.uuid
                );
                this.$router.replace({ name: 'HomePage' });
            }
        },
    },
};
</script>
