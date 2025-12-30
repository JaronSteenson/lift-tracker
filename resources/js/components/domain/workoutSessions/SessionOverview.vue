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
                :class="display.smAndDown.value ? 'py-1 min-h-0' : ''"
                :side="display.smAndDown.value ? 'start' : undefined"
            >
                <VTimelineItem
                    v-for="(sessionExercise, i) in exercises"
                    :key="sessionExercise.uuid"
                    :icon="i === 0 ? $svgIcons.mdiPlay : undefined"
                    :fill-dot="i === 0"
                    :color="i === 0 ? 'success' : 'primary'"
                >
                    <template v-if="!display.smAndDown.value" v-slot:opposite>
                        <div :class="`pt-1 font-weight-bold text--primary`">
                            +{{ sessionExercise.duration }}
                        </div>
                    </template>
                    <ExerciseSummaryCard :exercise="sessionExercise" />
                </VTimelineItem>
                <VTimelineItem :icon="$svgIcons.mdiStop" fill-dot color="error">
                    <template v-if="!display.smAndDown.value" v-slot:opposite>
                        <div :class="`pt-1 font-weight-bold text--primary`">
                            +{{ workoutDuration }}
                        </div>
                        <div>{{ workoutEndedAt }}</div>
                    </template>
                    <VCard v-if="display.smAndDown.value">
                        <VCardSubtitle>
                            {{ workoutEndedAt }}
                            <em
                                v-if="display.smAndDown.value"
                                class="subtitle--small"
                            >
                                +{{ workoutDuration }}
                            </em>
                        </VCardSubtitle>
                    </VCard>
                </VTimelineItem>
            </VTimeline>
        </NarrowContentContainer>
    </div>
</template>

<script setup>
import { computed, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import SessionStatsCard from './SessionStatsCard';
import ExerciseSummaryCard from './ExerciseSummaryCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import {
    useWorkoutSession,
    useDeleteWorkoutSession,
    getNotSkippedSessionExercises,
} from './composibles/workoutSessionQueries';
import {
    hoursMinutesSecondsFromStartEnd,
    minsSecDuration,
    timeDescription,
} from '../../../dates';

const props = defineProps({
    workoutSessionUuid: {
        type: String,
        required: true,
    },
});

const router = useRouter();
const display = useDisplay();

const { workoutSession: workoutSessionData } = useWorkoutSession(
    toRef(props, 'workoutSessionUuid'),
);
const { deleteWorkoutSession } = useDeleteWorkoutSession();

const workoutSession = computed(() => {
    return (
        workoutSessionData.value || {
            sessionExercises: [],
            startedAt: null,
            endedAt: null,
            uuid: null,
            createdAt: null,
        }
    );
});

const notSkippedSessionExercises = computed(() =>
    getNotSkippedSessionExercises(workoutSession.value),
);

const isCheckInOnly = computed(
    () => workoutSession.value.sessionExercises.length === 0,
);

const pageTitle = computed(() =>
    isCheckInOnly.value ? 'Check-in' : 'Session overview',
);

const exercises = computed(() => {
    return notSkippedSessionExercises.value.map((exercise, i) => ({
        ...exercise,
        startedAt: timeDescription(exercise.sessionSets[0].startedAt),
        duration:
            i === 0
                ? minsSecDuration(0, true)
                : hoursMinutesSecondsFromStartEnd(
                      workoutSession.value.startedAt,
                      exercise.sessionSets[0].startedAt,
                  ),
    }));
});

const workoutDuration = computed(() => {
    return hoursMinutesSecondsFromStartEnd(
        workoutSession.value.startedAt,
        workoutSession.value.endedAt,
    );
});

const workoutEndedAt = computed(() => {
    if (!workoutSession.value.endedAt) {
        return undefined;
    }

    return timeDescription(workoutSession.value.endedAt);
});

async function showDeleteConfirmation() {
    const deleteConfirmed = window.confirm(
        'Are you sure you want to delete this workout?',
    );

    if (deleteConfirmed) {
        deleteWorkoutSession(workoutSession.value.uuid);
        router.replace({ name: 'HomePage' });
    }
}
</script>
