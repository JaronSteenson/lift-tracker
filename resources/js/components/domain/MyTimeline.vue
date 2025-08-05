<template>
    <div>
        <VContainer v-show="showTable">
            <div class="d-flex justify-space-between align-center mb-4 gap-4">
                <AddNewButton
                    class="flex-grow-1"
                    :to="{ name: 'CheckInEditPage' }"
                >
                    Check-in
                </AddNewButton>
                <AddNewButton
                    class="flex-grow-1"
                    :to="{ name: 'NewSessionRoutineSelectPage' }"
                >
                    Session
                </AddNewButton>
            </div>
            <VToolbar dense>
                <VToolbarTitle>Timeline</VToolbarTitle>
                <VSpacer />
                <VSwitch
                    class="mt-4 pt-1"
                    v-model="showTable"
                    @change="setHomePageShowTable"
                    :append-icon="$svgIcons.mdiTable"
                />
            </VToolbar>
            <!-- eslint-disable vue/valid-v-slot -->
            <VDataTable
                :headers="headers"
                :items="myWorkoutSessions"
                :items-per-page="myWorkoutSessions.length"
                hide-default-footer
                mobile-breakpoint="0"
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
                            session.workoutProgramRoutine &&
                            session.workoutProgramRoutine.workoutProgram
                        "
                    />
                </template>
                <template v-slot:item.bodyWeight="{ item: session }">
                    {{ session.bodyWeight ? `${session.bodyWeight}kg` : '' }}
                </template>
                <template v-slot:item.duration="{ item: session }">
                    {{
                        session.startedAt
                            ? hoursMinutesSecondsFromStartEnd(
                                  session.startedAt,
                                  session.endedAt
                              )
                            : ''
                    }}
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
                                    params: {
                                        workoutSessionUuid: session.uuid,
                                    },
                                }"
                            >
                                <VListItemTitle>View overview</VListItemTitle>
                            </VListItem>
                            <VListItem
                                v-if="
                                    session.workoutProgramRoutine &&
                                    session.workoutProgramRoutine.uuid
                                "
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
                                @click="showDeleteConfirmation(session.uuid)"
                            >
                                <VListItemTitle>Delete</VListItemTitle>
                            </VListItem>
                        </VList>
                    </VMenu>
                </template>
            </VDataTable>
            <!-- eslint-enable -->
        </VContainer>

        <NarrowContentContainer
            class="flex-column gap-4"
            v-show="!showTable"
            :class="{ 'd-flex': !showTable }"
        >
            <div class="d-flex justify-space-between align-center gap-4">
                <AddNewButton
                    class="flex-grow-1"
                    :to="{ name: 'CheckInEditPage' }"
                >
                    Check-in
                </AddNewButton>
                <AddNewButton
                    class="flex-grow-1"
                    :to="{ name: 'NewSessionRoutineSelectPage' }"
                >
                    Session
                </AddNewButton>
            </div>
            <VToolbar class="sticky-toolbar" dense>
                <VToolbarTitle>Timeline</VToolbarTitle>
                <VSpacer />
                <VSwitch
                    class="mt-4 pt-1"
                    v-model="showTable"
                    @change="setHomePageShowTable"
                    :append-icon="$svgIcons.mdiTable"
                />
            </VToolbar>
            <SessionStatsCard
                v-for="workoutSession in myWorkoutSessions"
                :key="workoutSession.uuid"
                :workout-session="workoutSession"
                link-title
            />
        </NarrowContentContainer>
    </div>
</template>

<script>
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import { mapState, mapGetters } from 'vuex';
import SessionStatsCard from '../domain/workoutSessions/SessionStatsCard';
import { dateDescription, hoursMinutesSecondsFromStartEnd } from '../../dates';
import ProgramName from '../domain/programBuilder/ProgramName';
import AddNewButton from '../formFields/AddNewButton.vue';

export default {
    components: {
        AddNewButton,
        NarrowContentContainer,
        SessionStatsCard,
        ProgramName,
    },
    data() {
        return {
            showTable: localStorage.getItem('homePageShowTable') === 'true',
            loadingNextPage: false,
            newSessionModalProgramUuid: null,
        };
    },
    mounted() {
        this.infiniteScroll();
        window.addEventListener('scroll', this.infiniteScroll);
    },
    destroyed() {
        window.removeEventListener('scroll', this.infiniteScroll);
    },
    computed: {
        ...mapState('workoutSession', [
            'allPagesLoaded',
            'myWorkoutSessionsIsLoading',
            'myWorkoutSessions',
        ]),
        ...mapGetters('workoutSession', ['isInProgressWorkout']),
        headers() {
            if (this.$vuetify.breakpoint.xsOnly) {
                return [
                    {
                        text: 'Date',
                        value: 'startedAt',
                        sortable: false,
                    },
                    {
                        text: 'Routine',
                        value: 'name',
                        sortable: false,
                    },
                    {
                        text: 'BW',
                        value: 'bodyWeight',
                        sortable: false,
                    },
                ];
            }

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
                    width: '20%',
                    sortable: false,
                },
                {
                    text: 'Program',
                    value: 'programName',
                    width: '20%',
                    sortable: false,
                },
                {
                    text: 'Body weight',
                    value: 'bodyWeight',
                    width: '20%',
                    sortable: false,
                },
                {
                    text: 'Total duration',
                    value: 'duration',
                    width: '20%',
                    sortable: false,
                },
                {
                    text: '',
                    value: 'menu',
                    align: 'end',
                    sortable: false,
                },
            ];
        },
    },
    methods: {
        hoursMinutesSecondsFromStartEnd,
        setHomePageShowTable(value) {
            localStorage.setItem(
                'homePageShowTable',
                Boolean(value).toString()
            );
        },
        infiniteScroll() {
            const atBottom =
                document.documentElement.scrollTop + window.innerHeight ===
                document.documentElement.offsetHeight;
            if (
                atBottom &&
                !this.myWorkoutSessionsIsLoading &&
                !this.allPagesLoaded
            ) {
                this.loadNextPage();
            }
        },
        async loadNextPage() {
            this.loadingNextPage = true;
            await this.$store.dispatch('workoutSession/fetchNextPage');
            this.loadingNextPage = false;
        },
        showDeleteConfirmation(workoutSessionUuid) {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this workout?'
            );

            if (deleteConfirmed) {
                this.$store.dispatch(
                    'workoutSession/delete',
                    workoutSessionUuid
                );
            }
        },
        getFormattedDate(workoutSession) {
            let startedAt = dateDescription(
                workoutSession.startedAt || workoutSession.createdAt
            );

            if (this.isInProgressWorkout(workoutSession.uuid)) {
                startedAt = `${startedAt} (in progress)`;
            }

            return startedAt;
        },
    },
};
</script>

<style scoped>
.sticky-toolbar {
    position: sticky;
    top: 56px;
    z-index: 10; /* Make sure it stays above other content */
}
</style>
