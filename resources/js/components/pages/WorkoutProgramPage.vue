<template>
    <BootstrapCard v-bind:title="loading ? 'Loading program...' : title">
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <WorkoutProgramForm v-else></WorkoutProgramForm>
    </BootstrapCard>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutProgramForm from "../domain/WorkoutProgramForm";
    import LoadingSpinner from "../LoadingSpinner";
    import { mapState } from 'vuex'
    import WorkoutProgramService from "../../api/WorkoutProgramService";

    export default {
        name: 'CreateWorkoutProgramPage',
        components: { BootstrapCard, WorkoutProgramForm, LoadingSpinner },
        created () {
            this.fetchWorkoutProgram()
        },
        watch: {
            '$route': 'fetchWorkoutProgram' // Call again if the route changes.
        },
        data() {
            return {
                loading: true,
            }
        },
        computed: {
            title () {
                return this.isNew() ? 'Create new workout program' : `Edit ${this.name}`;
            },
            ...mapState('programBuilder', ['id', 'name', 'workoutProgramRoutines']),
        },
        methods: {
            async fetchWorkoutProgram() {
                const id = this.$route.params.id;

                if (id) {
                    this.loading = true;
                    await this.$store.dispatch('programBuilder/fetchById', id);
                    this.loading = false;
                }
            },
            isNew() {
                return !this.$route.params.id;
            }
        }
    }
</script>
