<template>
    <VCard anim>
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
        <VSimpleTable fixed-header v-else>
            <template>
                <thead>
                    <tr>
                        <th v-if="$vuetify.breakpoint.mdAndUp" style="width: 40px"/>
                        <th class="text-left">Program name</th>
                        <th v-if="$vuetify.breakpoint.mdAndUp" class="text-right">Last edited</th>
                        <th style="width: 40px"/>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        :key="program.uuid"
                        v-for="program in workoutPrograms"
                    >
                        <td v-if="$vuetify.breakpoint.mdAndUp">
                                <VIcon>mdi-table</VIcon>
                        </td>

                        <td>
                            <RouterLink :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }">{{
                                program.name }}
                            </RouterLink>
                        </td>

                        <td v-if="$vuetify.breakpoint.mdAndUp" class="text-right">
                            {{ program.updatedAt }}
                        </td>

                        <td>
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
                                    <VListItem>
                                        <VListItemTitle>Delete</VListItemTitle>
                                    </VListItem>
                                </VList>
                            </VMenu>
                        </td>
                    </tr>
                </tbody>
            </template>
        </VSimpleTable>
    </VCard>

</template>

<script>
    import WorkoutProgramService from '../../api/WorkoutProgramService';

    export default {
        components: {},
        created() {
            this.fetchWorkoutPrograms();
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetchWorkoutPrograms'
        },
        data() {
            return {
                workoutPrograms: [],
                loading: true,
            }
        },
        computed: {
            hasNoWorkoutProgram() {
                return this.workoutPrograms.length === 0;
            }
        },
        methods: {
            async fetchWorkoutPrograms() {
                this.loading = true;
                const response = await WorkoutProgramService.getAll();

                this.workoutPrograms = response.data;
                this.loading = false;
            }
        },
    }
</script>
