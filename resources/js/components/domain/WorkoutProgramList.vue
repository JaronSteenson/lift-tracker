<template>
    <BootstrapCard title="Your workout programs">
        <div v-if="loading">
            <loading-spinner></loading-spinner>
        </div>
        <div v-else>
            <div v-for="program in workoutPrograms" v-bind:key="program.id">
                <router-link v-bind:to="'/workout-programs/' + program.id" class="a">{{ program.name }}</router-link>
            </div>
        </div>

        <hr>

        <router-link tag="a" to="/workout-programs/create">
            Add new/another
        </router-link>
    </BootstrapCard>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutProgramService from "../../services/WorkoutProgramService";
    import LoadingSpinner from "../LoadingSpinner";

    export default {
        name: 'CreateWorkoutProgramList',
        components: {LoadingSpinner, BootstrapCard},
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
                this.workoutPrograms = await WorkoutProgramService.getAll();
                this.loading = false;
            }
        }
    }
</script>
