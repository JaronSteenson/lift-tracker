<template>
    <VCard anim>
        <v-toolbar
            color="primary"
            dark
        >
            <v-toolbar-title>Your workout programs</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn icon :to="{ name: 'newProgramBuilder' }">
                <VIcon>mdi-plus</VIcon>
            </v-btn>
        </v-toolbar>

        <VList v-if="loading">
            <VSkeletonLoader type="list-item-avatar-two-line@5" />
        </VList>
        <VList v-else>
            <v-list-item
                :key="program.uuid"
                v-for="program in workoutPrograms"
                :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }"
            >
                <VListItemAvatar>
                    <VIcon>mdi-table</VIcon>
                </VListItemAvatar>

                <v-list-item-content>
                    <v-list-item-title>{{ program.name }}</v-list-item-title>
                    <v-list-item-subtitle>Last edited {{ program.updatedAt }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                    <v-btn icon>
                        <VIcon color="grey lighten-1">mdi-table-cog</VIcon>
                    </v-btn>
                </v-list-item-action>
            </v-list-item>
        </VList>
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
