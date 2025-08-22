<template>
    <div>
        <AppBar :title="pageTitle" :back-to="{ name: 'HomePage' }">
            <template v-slot:right>
                <VMenu bottom left>
                    <template v-slot:activator="{ props }">
                        <VBtn icon flat v-bind="props">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :disabled="workoutSession.createdAt === null"
                            @click="showDeleteConfirmation"
                        >
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </AppBar>

        <NarrowContentContainer>
            <SessionStatsCard :workout-session="workoutSession" />

            <VTimeline
                v-if="workoutSession.sessionExercises.length !== 0"
                :dense="display.xs.value"
            >
                <VTimelineItem
                    v-for="(sessionExercise, i) in exercises"
                    :key="sessionExercise.uuid"
                    :icon="i === 0 ? $svgIcons.mdiPlay : undefined"
                    :fill-dot="i === 0"
                    :color="i === 0 ? 'success' : 'primary'"
                >
                    <template v-slot:opposite>
                        <div :class="`pt-1 font-weight-bold text--primary`">
                            +{{ sessionExercise.duration }}
                        </div>
                        <div>{{ sessionExercise.startedAt }}</div>
                    </template>
                    <ExerciseSummaryCard :exercise="sessionExercise" />
                </VTimelineItem>
                <VTimelineItem :icon="$svgIcons.mdiStop" fill-dot color="error">
                    <template v-slot:opposite>
                        <div :class="`pt-1 font-weight-bold text--primary`">
                            +{{ workoutDuration }}
                        </div>
                        <div>{{ workoutEndedAt }}</div>
                    </template>
                    <VCard v-if="display.xs.value">
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
        <ResumeWorkoutFab
            :show-when="isInProgress"
            :target-set-uuid="currentSet?.uuid"
        />
    </div>
</template>

<script>
import SessionStatsCard from './SessionStatsCard';
import ExerciseSummaryCard from './ExerciseSummaryCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import { useWorkoutSessionStore } from '../../../stores/workoutSession';
import {
    hoursMinutesSecondsFromStartEnd,
    minsSecDuration,
    timeDescription,
} from '../../../dates';
import { useDisplay } from 'vuetify';
import ResumeWorkoutFab from '../../ResumeWorkoutFab';

export default {
    components: {
        NarrowContentContainer,
        AppBar,
        SessionStatsCard,
        ExerciseSummaryCard,
        ResumeWorkoutFab,
    },
    props: {
        workoutSessionUuid: {
            type: String,
            required: true,
        },
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        const display = useDisplay();
        return { workoutSessionStore, display };
    },
    computed: {
        workoutName() {
            // TODO: Implement workoutName getter in store
            return this.workoutSessionStore.workoutName || 'Workout';
        },
        workoutSession() {
            // TODO: Implement workoutSession getter in store
            return (
                this.workoutSessionStore.workoutSession || {
                    sessionExercises: [],
                    startedAt: null,
                    endedAt: null,
                    uuid: null,
                    createdAt: null,
                }
            );
        },
        notSkippedSessionExercises() {
            return this.workoutSessionStore.notSkippedSessionExercises;
        },
        isCheckInOnly() {
            return this.workoutSession.sessionExercises.length === 0;
        },
        pageTitle() {
            return this.isCheckInOnly ? 'Check-in' : 'Session overview';
        },
        exercises() {
            return this.notSkippedSessionExercises.map((exercise, i) => ({
                ...exercise,
                startedAt: timeDescription(exercise.sessionSets[0].startedAt),
                duration:
                    i === 0
                        ? minsSecDuration(0, true)
                        : hoursMinutesSecondsFromStartEnd(
                              this.workoutSession.startedAt,
                              exercise.sessionSets[0].startedAt,
                          ),
            }));
        },
        isInProgress() {
            // TODO: Implement isInProgressWorkout getter in store
            return (
                this.workoutSessionStore.isInProgressWorkout?.(
                    this.workoutSession.uuid,
                ) || false
            );
        },
        currentSet() {
            // TODO: Implement currentSetForInProgressWorkout getter in store
            return this.workoutSessionStore.currentSetForInProgressWorkout?.(
                this.workoutSession.uuid,
            );
        },
        workoutDuration() {
            return hoursMinutesSecondsFromStartEnd(
                this.workoutSession.startedAt,
                this.workoutSession.endedAt,
            );
        },
        workoutEndedAt() {
            if (!this.workoutSession.endedAt) {
                return undefined;
            }

            return timeDescription(this.workoutSession.endedAt);
        },
    },
    methods: {
        async showDeleteConfirmation() {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this workout?',
            );

            if (deleteConfirmed) {
                await this.workoutSessionStore.delete(this.workoutSession.uuid);
                this.$router.replace({ name: 'HomePage' });
            }
        },
    },
};
</script>
