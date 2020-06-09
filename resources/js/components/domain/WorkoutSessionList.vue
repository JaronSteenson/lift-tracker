<template>
    <VCard>
        <VToolbar
            color="primary"
            dark
        >
            <VToolbarTitle>Your workout sessions</VToolbarTitle>

            <VSpacer/>

            <VBtn @click="showNewSessionModal" icon>
                <VIcon>mdi-plus</VIcon>
            </VBtn>
        </VToolbar>

        <VSkeletonLoader class="ma-5" type="table-heading, table-row@3" v-if="loading"/>
        <VDataTable v-else :headers="headers" :items="workoutSessionsForDisplay">
            <template v-slot:item.icon="{ item: program }">
                <VIcon>mdi-table</VIcon>
            </template>
            <template v-slot:item.name="{ item: session }">
                <RouterLink class="workout-name" :to="{ name: 'workoutSession', params: { workoutSessionUuid: session.uuid } }">
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
                            :to="{ name: 'workoutSession', params: { workoutSessionUuid: session.uuid } }">
                            <VListItemTitle>View</VListItemTitle>
                        </VListItem>
                        <VListItem @click="repeatWorkoutNow(session.uuid)">
                            <VListItemTitle>Repeat this workout now</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
            <template v-if="$vuetify.breakpoint.smAndUp" v-slot:item.menu="{ item: program }">
                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>mdi-dots-vertical</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }">
                            <VListItemTitle>Edit</VListItemTitle>
                        </VListItem>
                        <VListItem @click="showNewSessionModal(program.uuid)">
                            <VListItemTitle>New session</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>

        <NewSessionModal :program-uuid.sync="newSessionModalProgramUuid"></NewSessionModal>
    </VCard>
</template>

<script>
    import WorkoutSessionService from '../../api/WorkoutSessionService';
    import NewSessionModal from './workoutSessions/NewSessionModal';
    import { dateTimeDescription } from '../../filters';
    import UuidHelper from "../../UuidHelper";

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
                workoutSessions: [],
                loading: true,
                newSessionModalProgramUuid: null,
            }
        },
        computed: {
            hasNoWorkoutProgram() {
                return this.workoutSessions.length === 0;
            },
            workoutSessionsForDisplay() {
                return this.workoutSessions.map(workoutProgram => {
                    return { ...workoutProgram, ...{
                        updatedAt: dateTimeDescription(workoutProgram.updatedAt)
                    } };
                })
            },
            headers() {
                if (this.$vuetify.breakpoint.xsOnly) {
                    return [
                        {
                            text: 'Name',
                            value: 'name',
                        },
                        {
                            text: 'Last edited',
                            value: 'updatedAt',
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
                        text: 'Program name',
                        value: 'name',
                    },
                    {
                        text: 'Last edited',
                        value: 'updatedAt',
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
                const response = await WorkoutSessionService.getAll();

                this.workoutSessions = response.data;
                this.loading = false;
            },
            repeatWorkoutNow(sessionUuid) {
                const workoutSession = UuidHelper.findIn(this.workoutSessions, sessionUuid);

                const originRoutineUuid = workoutSession.

                this.$router.push({ name: 'newSessionOverview', params: { originRoutineUuid } });
            },
            showNewSessionModal() {
                this.newSessionModalProgramUuid = programUuid;
            }
        },
    }
</script>

<style lang="scss" scoped>
    .workout-name {
        color: var(--v-anchor-base);
        font-size: 1.15em;
    }
</style>
