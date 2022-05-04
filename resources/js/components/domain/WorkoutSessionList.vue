<template>
    <div>
        <!-- eslint-disable vue/valid-v-slot -->
        <VDataTable
            v-if="$vuetify.breakpoint.lgAndUp"
            :headers="headers"
            :items="myWorkoutSessions"
            :items-per-page="myWorkoutSessions.length"
            hide-default-footer
        >
            <template v-slot:item.startedAt="{ item: session }">
                <RouterLink
                    :to="{
                        name: 'SessionOverviewPage',
                        params: { workoutSessionUuid: session.uuid },
                    }"
                >
                    {{ getFormattedDate(session) }}
                </RouterLink>
            </template>
            <template v-slot:item.programName="{ item: session }">
                <ProgramName
                    :workoutProgram="
                        session.workoutProgramRoutine.workoutProgram
                    "
                />
            </template>
            <template v-slot:item.menu="{ item: session }">
                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{
                                name: 'SessionOverviewPage',
                                params: { workoutSessionUuid: session.uuid },
                            }"
                        >
                            <VListItemTitle>View overview</VListItemTitle>
                        </VListItem>
                        <VListItem
                            v-if="session.originProgramUuid"
                            :to="{
                                name: 'NewSessionOverviewPage',
                                params: {
                                    originRoutineUuid:
                                        session.workoutProgramRoutine.uuid,
                                },
                            }"
                        >
                            <VListItemTitle>Repeat now</VListItemTitle>
                        </VListItem>
                        <VListItem
                            @click="showArchiveConfirmation(session.uuid)"
                        >
                            <VListItemTitle>Archive</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>
        <!-- eslint-enable -->
        <NarrowContentContainer v-else>
            <div class="d-flex flex-column gap-4">
                <SessionStatsCard
                    v-for="workoutSession in myWorkoutSessions"
                    :key="workoutSession.uuid"
                    :workout-session="workoutSession"
                    link-title
                />
            </div>
        </NarrowContentContainer>

        <div class="text-center mt-5">
            <VBtn
                v-if="!myMyWorkoutSessionsPagesAllLoaded"
                depressed
                small
                :loading="loadingNextPage"
                @click="loadNextPage"
            >
                Load more
            </VBtn>
        </div>
    </div>
</template>

<script>
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import { mapState, mapGetters } from 'vuex';
import SessionStatsCard from '../domain/workoutSessions/SessionStatsCard';
import { dateDescription } from '../../dates';
import ProgramName from '../domain/programBuilder/ProgramName';

export default {
    components: {
        NarrowContentContainer,
        SessionStatsCard,
        ProgramName,
    },
    data() {
        return {
            loadingNextPage: false,
            newSessionModalProgramUuid: null,
        };
    },
    computed: {
        ...mapState('workoutSession', ['myMyWorkoutSessionsPagesAllLoaded']),
        ...mapGetters('workoutSession', [
            'myWorkoutSessions',
            'isInProgressWorkout',
        ]),
        headers() {
            return [
                {
                    text: 'Date',
                    value: 'startedAt',
                    width: '20%',
                    sortable: false,
                },
                {
                    text: 'Routine',
                    value: 'name',
                    width: '40%',
                    sortable: false,
                },
                {
                    text: 'Program',
                    value: 'programName',
                    width: '40%',
                    sortable: false,
                },
                {
                    text: 'Actions',
                    value: 'menu',
                    align: 'end',
                    sortable: false,
                },
            ];
        },
    },
    methods: {
        async loadNextPage() {
            this.loadingNextPage = true;
            await this.$store.dispatch('workoutSession/fetchNextPage');
            this.loadingNextPage = false;
        },
        showArchiveConfirmation(workoutSessionUuid) {
            const archiveConfirmed = window.confirm(
                'Are you sure you want to archive this workout?'
            );

            if (archiveConfirmed) {
                this.$store.dispatch(
                    'workoutSession/archive',
                    workoutSessionUuid
                );
            }
        },
        getFormattedDate(workoutSession) {
            let startedAt = dateDescription(workoutSession.startedAt);

            if (this.isInProgressWorkout(workoutSession.uuid)) {
                startedAt = `${startedAt} (in progress)`;
            }

            return startedAt;
        },
    },
};
</script>
