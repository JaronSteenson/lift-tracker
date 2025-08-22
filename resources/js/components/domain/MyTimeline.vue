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
            <VToolbar :color="toolbarColor" elevation="1">
                <VToolbarTitle class="text-left">Timeline</VToolbarTitle>
                <VSwitch
                    class="mt-4 pt-1 mr-4"
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
                                  session.endedAt,
                              )
                            : ''
                    }}
                </template>
                <template v-slot:item.menu="{ item: session }">
                    <VMenu bottom left>
                        <template v-slot:activator="{ props }">
                            <VBtn icon flat v-bind="props">
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
            <div v-if="loadingNextPage" class="text-center py-4">
                <VProgressCircular indeterminate color="primary" />
                <div class="mt-2 text-body-2 text-medium-emphasis">
                    Loading more...
                </div>
            </div>
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
            <VToolbar
                class="sticky-toolbar"
                :color="toolbarColor"
                elevation="1"
            >
                <VToolbarTitle class="text-left">Timeline</VToolbarTitle>
                <VSwitch
                    class="mt-4 pt-1 mr-4"
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
            <div v-if="loadingNextPage" class="text-center py-4">
                <VProgressCircular indeterminate color="primary" />
                <div class="mt-2 text-body-2 text-medium-emphasis">
                    Loading more...
                </div>
            </div>
        </NarrowContentContainer>
    </div>
</template>

<script>
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import { useWorkoutSessionStore } from '../../stores/workoutSession';
import SessionStatsCard from '../domain/workoutSessions/SessionStatsCard';
import { dateDescription, hoursMinutesSecondsFromStartEnd } from '../../dates';
import ProgramName from '../domain/programBuilder/ProgramName';
import AddNewButton from '../formFields/AddNewButton.vue';
import { useDisplay } from 'vuetify';
import { useTheme } from 'vuetify/framework';

export default {
    components: {
        AddNewButton,
        NarrowContentContainer,
        SessionStatsCard,
        ProgramName,
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        const display = useDisplay();
        const theme = useTheme();

        const toolbarColor = theme.current.value.colors.toolbar;
        return { workoutSessionStore, display, toolbarColor };
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
        allPagesLoaded() {
            return this.workoutSessionStore.allPagesLoaded;
        },
        myWorkoutSessionsIsLoading() {
            return this.workoutSessionStore.myWorkoutSessionsIsLoading;
        },
        myWorkoutSessions() {
            return this.workoutSessionStore.myWorkoutSessions;
        },
        isInProgressWorkout() {
            return this.workoutSessionStore.isInProgressWorkout;
        },
        headers() {
            if (this.display.xs.value) {
                return [
                    {
                        title: 'Date',
                        key: 'startedAt',
                        sortable: false,
                    },
                    {
                        title: 'Routine',
                        key: 'name',
                        sortable: false,
                    },
                    {
                        title: 'BW',
                        key: 'bodyWeight',
                        sortable: false,
                    },
                ];
            }

            return [
                {
                    title: 'Date',
                    key: 'startedAt',
                    width: '20%',
                    sortable: false,
                },
                {
                    title: 'Routine',
                    key: 'name',
                    width: '20%',
                    sortable: false,
                },
                {
                    title: 'Program',
                    key: 'programName',
                    width: '20%',
                    sortable: false,
                },
                {
                    title: 'Body weight',
                    key: 'bodyWeight',
                    width: '20%',
                    sortable: false,
                },
                {
                    title: 'Total duration',
                    key: 'duration',
                    width: '20%',
                    sortable: false,
                },
                {
                    title: '',
                    key: 'menu',
                    align: 'end',
                    sortable: false,
                },
            ];
        },
    },
    methods: {
        hoursMinutesSecondsFromStartEnd,
        setHomePageShowTable() {
            localStorage.setItem(
                'homePageShowTable',
                Boolean(this.showTable).toString(),
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
            await this.workoutSessionStore.fetchNextPage();
            this.loadingNextPage = false;
        },
        showDeleteConfirmation(workoutSessionUuid) {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this workout?',
            );

            if (deleteConfirmed) {
                this.workoutSessionStore.delete(workoutSessionUuid);
            }
        },
        getFormattedDate(workoutSession) {
            let startedAt = dateDescription(
                workoutSession.startedAt || workoutSession.createdAt,
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
