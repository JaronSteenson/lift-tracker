<template>
    <BootstrapCard v-bind:title="loading ? 'Loading program...' : title">
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <WorkoutProgramForm v-else :workoutProgram="workoutProgram"></WorkoutProgramForm>
    </BootstrapCard>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutProgramForm from "../domain/WorkoutProgramForm";
    import LoadingSpinner from "../LoadingSpinner";
    import WorkoutProgramService from "../../services/WorkoutProgramService";

    export default {
        name: 'CreateWorkoutProgramPage',
        components: { BootstrapCard, WorkoutProgramForm, LoadingSpinner },
        created () {
            this.fetchWorkoutProgram()
        },
        watch: {
            // call again if the route changes
            '$route': 'fetchWorkoutProgram'
        },
        data() {
            return {
                workoutProgram: {
                    id: null,
                    name: '',
                    workoutProgramRoutines: [{
                        name: null,
                        normalDay: 'any',
                        routineExercises: [{}],
                    }]
                },
                loading: true,
            }
        },
        computed: {
            title () {
                return this.isNew() ? 'Create new workout program' : `Edit ${this.workoutProgram.name}`;
            }
        },
        methods: {
            async fetchWorkoutProgram() {
                this.loading = true;

                const id = this.$route.params.id;

                if (id) {
                    this.workoutProgram = await WorkoutProgramService.get(id);
                }

                this.loading = false;
            },
            isNew() {
                return !this.$route.params.id;
            }
        }
    }
</script>
