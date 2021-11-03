<template>
    <div>
        <VCard
            v-if="myWorkoutPrograms.length === 0"
        >
            To get started build a program.
        </VCard>
        <VDataTable
            v-else
            :headers="headers"
            :items="myWorkoutPrograms"
            :items-per-page="myWorkoutPrograms.length"
            hide-default-footer
        >
            <template v-slot:item.name="{ item: program }">
                <RouterLink :to="{ name: 'ProgramBuilderPage', params: { workoutProgramUuid: program.uuid } }">
                    <template v-if="program.name">{{ program.name }}</template>
                    <MissingValue v-else full-opacity>Unnamed program</MissingValue>
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
                            :to="{ name: 'ProgramBuilderPage', params: { workoutProgramUuid: program.uuid } }">
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
    import { mapActions, mapGetters } from "vuex";
    import MissingValue from "../util/MissingValue";

    export default {
        components: {
            MissingValue,
            NewSessionModal,
        },
        data() {
            return {
                newSessionModalProgramUuid: null,
            }
        },
        computed: {
            ...mapGetters('programBuilder', ['myWorkoutPrograms']),
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
                        value: 'updatedAtDescription',
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
            showNewSessionModal(programUuid) {
                this.newSessionModalProgramUuid = programUuid;
            },
            async showArchiveConfirmation(programUuid) {
                const archiveConfirmed = window.confirm('Are you sure you want to archive this program?');

                if (archiveConfirmed) {
                    await this.archive(programUuid);
                }
            },
        },
    }
</script>
