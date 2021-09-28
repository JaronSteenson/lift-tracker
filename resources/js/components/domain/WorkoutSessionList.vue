<template>
    <div>
        <VSkeletonLoader v-if="!hasLoadedFirstPage" class="ma-5" type="table-row@10"/>
        <VDataTable
            v-else
            :headers="headers"
            :items="workoutSessionsForDisplay"
            :items-per-page="workoutSessionsForDisplay.length"
            hide-default-footer
        >
            <template v-slot:item.startedAt="{ item: session }">
                <RouterLink :to="{ name: 'sessionOverview', params: { workoutSessionUuid: session.uuid } }">
                    {{ session.startedAt }}
                </RouterLink>
            </template>
            <template v-slot:item.programName="{ item: session }">
                <RouterLink
                    v-if="session.originProgramUuid"
                    :to="{ name: 'programBuilder', params: { workoutProgramUuid: session.originProgramUuid } }"
                >
                    {{ session.programName }}
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
                            :to="{ name: 'sessionOverview', params: { workoutSessionUuid: session.uuid } }"
                        >
                            <VListItemTitle>View summary</VListItemTitle>
                        </VListItem>
                        <VListItem v-if="session.originProgramUuid" :to="{ name: 'newSessionOverview', params: { originRoutineUuid: session.originProgramUuid } }">
                            <VListItemTitle>Repeat now</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>

        <VCardActions class="justify-center">
            <VBtn
                v-if="!workoutSessionsPagesAllLoaded && hasLoadedFirstPage"
                class="mt-5"
                depressed
                small
                block
                :loading="loadingSubsequentPage"
                @click="loadNextPage"
            >
                Load more
            </VBtn>
        </VCardActions>
    </div>
</template>

<script>
    import MissingValue from './../util/MissingValue';
    import NewSessionModal from './workoutSessions/NewSessionModal';
    import { dateDescription } from '../../dates';
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {
            NewSessionModal,
            MissingValue,
        },
        created() {
            this.fetchWorkoutSessions();
        },
        watch: {
            // call again the method if the route changes
            $route: 'fetchWorkoutSessions'
        },
        data() {
            return {
                loadingSubsequentPage: false,
                newSessionModalProgramUuid: null,
            }
        },
        computed: {
            ...mapState('workoutSession', ['workoutSessions', 'workoutSessionsPagesAllLoaded']),
            ...mapGetters('workoutSession', ['hasLoadedFirstPage']),
            hasNoWorkoutProgram() {
                return this.workoutSessions.length === 0;
            },
            workoutSessionsForDisplay() {
                return this.workoutSessions.map(workoutSession => {
                    let startedAt = dateDescription(workoutSession.startedAt);

                    if (this.isInProgress(workoutSession.uuid)) {
                        startedAt = `${startedAt} (in progress)`;
                    }

                    const workoutProgram = workoutSession?.workoutProgramRoutine?.workoutProgram;
                    const programName = workoutProgram ? workoutProgram.name : '(Archived program)'
                    const originProgramUuid = workoutProgram ? workoutProgram.uuid : null;

                    return { ...workoutSession, ...{
                        startedAt,
                        programName,
                        originProgramUuid,
                    } };
                })
            },
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
            async fetchWorkoutSessions() {
                await this.$store.dispatch('workoutSession/fetchFirstPage');
            },
            async loadNextPage() {
                this.loadingSubsequentPage = true;
                await this.$store.dispatch('workoutSession/fetchNextPage');
                this.loadingSubsequentPage = false;
            },
            getOriginRoutineUuid(sessionUuid) {
                return this.$store.getters['workoutSession/originRoutineUuid'](sessionUuid);
            },
            isInProgress(workoutSessionUuid) {
                return this.$store.getters['workoutSession/isInProgressWorkout'](workoutSessionUuid);
            },
        },
    }
</script>
