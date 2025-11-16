<template>
    <VContainer>
        <!-- eslint-disable vue/valid-v-slot -->
        <VDataTable
            :headers="headers"
            :items="data"
            :items-per-page="data?.length"
            hide-default-footer
        >
            <template v-slot:item.name="{ item: program }">
                <ProgramName :workoutProgram="program" />
            </template>
            <template v-slot:item.menu="{ item: program }">
                <VMenu bottom left>
                    <template v-slot:activator="{ props }">
                        <VBtn icon flat v-bind="props">
                            <VIcon>{{ svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{
                                name: 'ProgramBuilderPage',
                                params: { workoutProgramUuid: program.uuid },
                            }"
                        >
                            <VListItemTitle>Edit</VListItemTitle>
                        </VListItem>
                        <VListItem
                            @click="showDeleteConfirmation(program.uuid)"
                        >
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>
        <!-- eslint-enable -->
        <div class="d-flex justify-space-between align-center mt-4 w">
            <AddNewButton
                class="flex-grow-1"
                :to="{ name: 'ProgramBuilderPageNew' }"
            >
                Program
            </AddNewButton>
        </div>
    </VContainer>
</template>

<script>
import ProgramName from '../domain/programBuilder/ProgramName';
import AddNewButton from '../formFields/AddNewButton.vue';
import { svgIcons } from '../../vuetify';
import { useWorkoutProgramList } from './programBuilder/composibles/programBuilderQueries';

export default {
    name: 'WorkoutProgramList',
    components: {
        AddNewButton,
        ProgramName,
    },
    setup() {
        const { data, isPending } = useWorkoutProgramList();
        return { data, isPending, svgIcons };
    },
    data() {
        return {
            newSessionModalProgramUuid: null,
        };
    },
    computed: {
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
                },
            ];
        },
    },
    methods: {
        showNewSessionModal(programUuid) {
            this.newSessionModalProgramUuid = programUuid;
        },
        async showDeleteConfirmation(programUuid) {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this program?',
            );

            if (deleteConfirmed) {
                try {
                    await this.programBuilderStore.deleteProgram(programUuid);
                    // Refresh the programs list after successful deletion
                    await this.programBuilderStore.fetchMyWorkoutPrograms();
                } catch (error) {
                    console.error('Error deleting program:', error);
                    alert('Failed to delete program. Please try again.');
                }
            }
        },
    },
};
</script>
