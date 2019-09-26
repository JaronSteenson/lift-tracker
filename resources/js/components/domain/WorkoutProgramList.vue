<template>
    <BootstrapCard title="Your workout programs">
        <loading-spinner v-if="loading"></loading-spinner>
        <div v-else v-for="program in workoutPrograms" v-bind:key="program.id">
            <routerLink v-bind:to="'/workout-programs/' + program.id" class="a">{{ program.name }}</routerLink>
        </div>

        <hr>

        <routerLink tag="a" to="/workout-programs/create">
            Add new/another
        </routerLink>
    </BootstrapCard>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutProgramService from "../../api/WorkoutProgramService";
    import LoadingSpinner from "../LoadingSpinner";

    export default {
        name: 'CreateWorkoutProgramList',
        components: { LoadingSpinner, BootstrapCard },
        created() {
            this.fetchWorkoutPrograms()
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
                this.workoutPrograms = await WorkoutProgramService.getAll();
                this.loading = false;
            }
        }
    }
</script>
