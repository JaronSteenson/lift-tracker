<template>
    <div>
        <VDataTable
            :headers="headers"
            :items="myWorkoutSessions"
            :items-per-page="myWorkoutSessions.length"
            hide-default-footer
        >
            <template v-slot:item.startedAt="{ item: session }">
                <RouterLink :to="{ name: 'SessionOverviewPage', params: { workoutSessionUuid: session.uuid } }">
                    {{ session.startedAt }}
                </RouterLink>
            </template>
            <template v-slot:item.programName="{ item: session }">
                <RouterLink
                    v-if="session.originProgramUuid"
                    :to="{ name: 'ProgramBuilderPage', params: { workoutProgramUuid: session.originProgramUuid } }"
                >
                    <template v-if="session.programName">{{ session.programName }}</template>
                    <MissingValue full-opacity v-else>Unnamed program</MissingValue>
                </RouterLink>
                <!--  Archived -->
                <MissingValue v-else>{{ session.programName }}</MissingValue>
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
                            :to="{ name: 'SessionOverviewPage', params: { workoutSessionUuid: session.uuid } }"
                        >
                            <VListItemTitle>View overview</VListItemTitle>
                        </VListItem>
                        <VListItem
                            v-if="session.originProgramUuid"
                            :to="{ name: 'NewSessionOverviewPage', params: { originRoutineUuid: session.workoutProgramRoutine.uuid } }"
                        >
                            <VListItemTitle>Repeat now</VListItemTitle>
                        </VListItem>
                        <VListItem @click="showArchiveConfirmation(session.uuid)">
                            <VListItemTitle>Archive</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>

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
    import MissingValue from './../util/MissingValue';
    import NewSessionModal from './workoutSessions/NewSessionModal';
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {
            NewSessionModal,
            MissingValue,
        },
        data() {
            return {
                loadingNextPage: false,
                newSessionModalProgramUuid: null,
            }
        },
        computed: {
            ...mapState('workoutSession', ['myMyWorkoutSessionsPagesAllLoaded']),
            ...mapGetters('workoutSession', ['myWorkoutSessions']),
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
                    }
                ];
            }
        },
        methods: {
            async loadNextPage() {
                this.loadingNextPage = true;
                await this.$store.dispatch('workoutSession/fetchNextPage');
                this.loadingNextPage = false;
            },
            showArchiveConfirmation(workoutSessionUuid) {
                const archiveConfirmed = window.confirm('Are you sure you want to archive this workout?');

                if (archiveConfirmed) {
                    this.$store.dispatch('workoutSession/archive', workoutSessionUuid);
                }
            },
        },
    }
</script>
