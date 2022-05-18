<template>
    <VContainer v-if="showTable">
        <VToolbar dense>
            <VToolbarTitle> My sessions </VToolbarTitle>
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
                                params: {
                                    workoutSessionUuid: session.uuid,
                                },
                            }"
                        >
                            <VListItemTitle>View overview</VListItemTitle>
                        </VListItem>
                        <VListItem
                            v-if="session.workoutProgramRoutine.uuid"
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
    </VContainer>

    <NarrowContentContainer class="d-flex flex-column gap-4" v-else>
        <VToolbar dense>
            <VToolbarTitle> My sessions </VToolbarTitle>
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
            'myMyWorkoutSessionsPagesAllLoaded',
            'myWorkoutSessions',
        ]),
        ...mapGetters('workoutSession', ['isInProgressWorkout']),
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
            if (atBottom) {
                this.loadNextPage();
            }
        },
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
