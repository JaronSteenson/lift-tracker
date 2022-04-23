<template>
    <div>
        <PageToolbar title="Session overview" :back-to="{ name: 'HomePage' }">
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
                            @click="showArchiveConfirmation"
                        >
                            <VListItemTitle>Archive</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </PageToolbar>

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
                        <VIcon>{{ $svgIcons.mdiPlay }}</VIcon> Resume
                    </VBtn>
                </div>
            </VAlert>

            <SessionStatsCard :workout-session="workoutSession" />

            <ExerciseSummaryCard
                class="mt-5"
                v-for="sessionExercise in sessionExercises"
                :exercise="sessionExercise"
                :key="sessionExercise.uuid"
            />
        </NarrowContentContainer>
    </div>
</template>

<script>
import SessionStatsCard from './SessionStatsCard';
import { mapGetters } from 'vuex';
import ExerciseSummaryCard from './ExerciseSummaryCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import PageToolbar from '../../layouts/PageToolbar';

export default {
    components: {
        NarrowContentContainer,
        PageToolbar,
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
            'sessionExercises',
        ]),
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
    },
    methods: {
        showArchiveConfirmation() {
            const archiveConfirmed = window.confirm(
                'Are you sure you want to archive this workout?'
            );

            if (archiveConfirmed) {
                this.$store.dispatch(
                    'workoutSession/archive',
                    this.workoutSession.uuid
                );
                this.$router.replace({ name: 'HomePage' });
            }
        },
    },
};
</script>
