<template>
    <div>
        <VCard v-if="isArchiving" loading>
            <VCardText>
                Archiving workout...
            </VCardText>
        </VCard>
        <VSkeletonLoader v-if="loading" class="ma-5" type="table-row@10"/>
        <VDataTable
            v-else
            :headers="headers"
            :items="workoutProgramsForDisplay"
            :items-per-page="workoutProgramsForDisplay.length"
            hide-default-footer
        >
            <template v-slot:item.name="{ item: program }">
                <RouterLink :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }">
                    <template v-if="program.name">{{ program.name }}</template>
                    <MissingValue v-else>Unnamed program</MissingValue>
                </RouterLink>
            </template>
            <template v-slot:item.menu="{ item: program }">
                <VMenu bottom left>
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }">
                            <VListItemTitle>Edit</VListItemTitle>
                        </VListItem>
                        <VListItem @click="showNewSessionModal(program.uuid)">
                            <VListItemTitle>New session from this program</VListItemTitle>
                        </VListItem>
                        <VListItem @click="showArchiveConfirmation(program.uuid)">
                            <VListItemTitle>Archive</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>

        <NewSessionModal :program-uuid.sync="newSessionModalProgramUuid"/>
    </div>
</template>

<script>
    import WorkoutProgramService from '../../api/WorkoutProgramService';
    import NewSessionModal from './workoutSessions/NewSessionModal';
    import { dateTimeDescription } from "../../dates";
    import {mapActions} from "vuex";
    import MissingValue from "../util/MissingValue";

    export default {
        components: {
            MissingValue,
            NewSessionModal,
        },
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
                isArchiving: false,
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
                return [
                    {
                        text: 'Name',
                        value: 'name',
                        width: '70%',
                        sortable: false,
                    },
                    {
                        text: 'Last edited',
                        value: 'updatedAt',
                        align: 'end',
                        width: '30%',
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
            ...mapActions('programBuilder', ['archive']),
            async fetchWorkoutPrograms() {
                this.loading = true;
                const response = await WorkoutProgramService.getAll();

                this.workoutPrograms = response.data;
                this.loading = false;
            },
            showNewSessionModal(programUuid) {
                this.newSessionModalProgramUuid = programUuid;
            },
            async showArchiveConfirmation(programUuid) {
                const archiveConfirmed = window.confirm('Are you sure you want to archive this program?');

                if (archiveConfirmed) {
                    this.loading = true;
                    this.isArchiving = true;
                    await this.archive(programUuid);
                    this.isArchiving = false;
                    await this.fetchWorkoutPrograms();
                    this.loading = false;
                }
            },
        },
    }
</script>
