<template>
    <div class="row justify-content-center">
        `
        <div class="col-md-8">
            <BootstrapCard title="Your workout programs">
                <div v-if="loading" class="row justify-content-center">
                    <loading-spinner></loading-spinner>
                </div>

                <div v-else v-for="program in workoutPrograms" :key="program.id">
                    <routerLink :to="{ name: 'programBuilder', params: { workoutProgramId: program.id } }">{{ program.name }}</routerLink>
                </div>

                <hr>

                <routerLink tag="a" :to="{ name: 'newProgramBuilder' }">
                    Add new/another
                </routerLink>
            </BootstrapCard>
        </div>
        `
    </div>
</template>

<script>
    import BootstrapCard from '../BootstrapCard';
    import WorkoutProgramService from '../../api/WorkoutProgramService';
    import LoadingSpinner from '../LoadingSpinner';

    export default {
        components: {
            LoadingSpinner,
            BootstrapCard
        },
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
        methods: {
            async fetchWorkoutPrograms() {
                this.loading = true;
                const response = await WorkoutProgramService.getAll();

                this.workoutPrograms = response.data;
                this.loading = false;
            }
        }
    }
</script>
