<template>
    <VCard>
        <VToolbar
            color="primary"
            dark
        >
            <VToolbarTitle>Your workout programs</VToolbarTitle>

            <VSpacer/>

            <VBtn :to="{ name: 'newProgramBuilder' }" icon>
                <VIcon>mdi-plus</VIcon>
            </VBtn>
        </VToolbar>

        <VSkeletonLoader class="ma-5" type="table-heading, table-row@3" v-if="loading"/>
        <VDataTable v-else :headers="headers" :items="workoutProgramsForDisplay">
            <template v-slot:item.icon="{ item: program }">
                <VIcon>mdi-table</VIcon>
            </template>
            <template v-slot:item.name="{ item: program }">
                <RouterLink class="program-name" :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }">
                    {{ program.name }}
                </RouterLink>
                <VMenu v-if="$vuetify.breakpoint.xsOnly" bottom left>
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
    import WorkoutProgramService from '../../api/WorkoutProgramService';
    import NewSessionModal from "./workoutSessions/NewSessionModal";
    import { dateTimeDescription } from "../../dates";

    export default {
        components: {NewSessionModal},
        created() {
            this.fetchWorkoutPrograms();
        },
        watch: {
            // call again the method if the route changes
            $route: 'fetchWorkoutPrograms'
        },
        data() {
            return {
                workoutPrograms: [],
                loading: true,
                newSessionModalProgramUuid: null,
            }
        },
        computed: {
            hasNoWorkoutProgram() {
                return this.workoutPrograms.length === 0;
            },
            workoutProgramsForDisplay() {
                return this.workoutPrograms.map(workoutProgram => {
                    return { ...workoutProgram, ...{ updatedAt: dateTimeDescription(workoutProgram.updatedAt) } };
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
            async fetchWorkoutPrograms() {
                this.loading = true;
                const response = await WorkoutProgramService.getAll();

                this.workoutPrograms = response.data;
                this.loading = false;
            },
            showNewSessionModal(programUuid) {
                this.newSessionModalProgramUuid = programUuid;
            }
        },
    }
</script>

<style lang="scss" scoped>
    .program-name {
        color: var(--v-anchor-base);
        font-size: 1.15em;
    }
</style>
