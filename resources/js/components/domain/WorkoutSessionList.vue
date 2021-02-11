<template>
    <VCard>
        <VToolbar
            color="primary"
            dark
        >
            <VToolbarTitle>Your workout sessions</VToolbarTitle>

            <VSpacer/>

<!--            <VBtn @click="showNewSessionModal" icon>-->
<!--                <VIcon>mdi-plus</VIcon>-->
<!--            </VBtn>-->
        </VToolbar>

        <VSkeletonLoader class="ma-5" type="table-heading, table-row@3" v-if="loading"/>
        <VDataTable
            v-else
            :headers="headers"
            :items="workoutSessionsForDisplay"
            :items-per-page="workoutSessionsForDisplay.length"
            hide-default-footer
        >
            <template v-slot:item.icon="{ item: session }">
                <VIcon v-if="isInProgress(session.uuid)" color="success">mdi-play</VIcon>
                <VIcon v-else>mdi-dumbbell</VIcon>
            </template>
            <template v-slot:item.name="{ item: session }">
                <RouterLink class="workout-name" :to="{ name: 'sessionOverview', params: { workoutSessionUuid: session.uuid } }">
                    {{ session.name }}
                </RouterLink>
                <VMenu v-if="$vuetify.breakpoint.xsOnly" bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>mdi-dots-vertical</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{ name: 'sessionOverview', params: { workoutSessionUuid: session.uuid } }">
                            <VListItemTitle>View summary</VListItemTitle>
                        </VListItem>
                        <VListItem @click="repeatWorkoutNow(session.uuid)">
                            <VListItemTitle>Repeat this workout now</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
            <template v-slot:item.programName="{ item: session }">
                <RouterLink
                    :to="{ name: 'programBuilder', params: { workoutProgramUuid: getOriginProgramId(session) } }"
                    class="workout-name"
                >
                    {{ session.workoutProgramRoutine.workoutProgram.name }}
                </RouterLink>
            </template>
            <template v-if="$vuetify.breakpoint.smAndUp" v-slot:item.menu="{ item: session }">
                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>mdi-dots-vertical</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{ name: 'sessionOverview', params: { workoutSessionUuid: session.uuid } }">
                            <VListItemTitle>View summary</VListItemTitle>
                        </VListItem>
                        <VListItem @click="repeatWorkoutNow(session.uuid)">
                            <VListItemTitle>Repeat this workout now</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>

        <VCardActions class="justify-center">
            <VBtn
                v-if="!workoutSessionsPagesAllLoaded && !loading"
                depressed
                small
                block
                :loading="loadingPage"
                @click="loadNextPage"
            >
                Load more
            </VBtn>
        </VCardActions>

        <NewSessionModal :program-uuid.sync="newSessionModalProgramUuid"></NewSessionModal>
    </VCard>
</template>

<script>
    import NewSessionModal from './workoutSessions/NewSessionModal';
    import {dateDescription} from '../../dates';
    import UuidHelper from "../../UuidHelper";
    import {mapState} from "vuex";

    export default {
        components: { NewSessionModal },
        created() {
            this.fetchWorkoutSessions();
        },
        watch: {
            // call again the method if the route changes
            $route: 'fetchWorkoutSessions'
        },
        data() {
            return {
                loading: true,
                loadingPage: false,
                newSessionModalProgramUuid: null,
            }
        },
        computed: {
            ...mapState('workoutSession', ['workoutSessions', 'workoutSessionsPagesAllLoaded']),
            hasNoWorkoutProgram() {
                return this.workoutSessions.length === 0;
            },
            workoutSessionsForDisplay() {
                return this.workoutSessions.map(workoutSession => {
                    let startedAt = dateDescription(workoutSession.startedAt);

                    if (this.isInProgress(workoutSession.uuid)) {
                        startedAt = `${startedAt} (in progress)`;
                    }

                    return { ...workoutSession, ...{
                        startedAt,
                        programName: workoutSession.workoutProgramRoutine.workoutProgram.name,
                    } };
                })
            },
            headers() {
                if (this.$vuetify.breakpoint.xsOnly) {
                    return [
                        {
                            text: 'Routine name',
                            value: 'name',
                        },
                        {
                            text: 'Date',
                            value: 'startedAt',
                        },
                    ]
                }

                return [
                    {
                        sortable: false,
                        value: 'icon',
                        width: '40',
                    },
                    {
                        text: 'Routine name',
                        value: 'name',
                    },
                    {
                        text: 'Program name',
                        value: 'programName',
                    },
                    {
                        text: 'Date',
                        value: 'startedAt',
                        align: 'end',
                    },
                    {
                        sortable: false,
                        value: 'menu',
                        width: '40',
                    }
                ];
            }
        },
        methods: {
            async fetchWorkoutSessions() {
                this.loading = true;
                await this.$store.dispatch('workoutSession/fetchFirstPage');
                this.loading = false;
            },
            async loadNextPage() {
                this.loadingPage = true;
                await this.$store.dispatch('workoutSession/fetchNextPage');
                this.loadingPage = false;
            },
            repeatWorkoutNow(sessionUuid) {
                const workoutSession = UuidHelper.findIn(this.workoutSessions, sessionUuid);

                const originRoutineUuid = workoutSession.workoutProgramRoutine.uuid;

                this.$router.push({ name: 'newSessionOverview', params: { originRoutineUuid } });
            },
            // showNewSessionModal() {
            //     this.newSessionModalProgramUuid = programUuid;
            // },
            getOriginProgramId(session) {
                return session?.workoutProgramRoutine?.workoutProgram.uuid
            },
            isInProgress(workoutSessionUuid) {
                return this.$store.getters['workoutSession/isInProgressWorkout'](workoutSessionUuid);
            },
        },
    }
</script>

<style lang="scss" scoped>
    .workout-name {
        color: var(--v-anchor-base);
        font-size: 1.15em;
    }
</style>
