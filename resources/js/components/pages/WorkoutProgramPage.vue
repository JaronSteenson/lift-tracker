<template>
    <BootstrapCard v-bind:title="title">
        <WorkoutProgramForm :workoutProgram="workoutProgram"></WorkoutProgramForm>
    </BootstrapCard>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutProgramForm from "../domain/WorkoutProgramForm";
    import WorkoutProgramService from "../../services/WorkoutProgramService";

    export default {
        name: 'CreateWorkoutProgramPage',
        components: {BootstrapCard, WorkoutProgramForm},
        created () {
            this.fetchWorkoutProgram()
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetchWorkoutProgram'
        },
        data() {
            return {
                workoutProgram: {
                    id: null,
                    name: '',
                    workoutProgramRoutines: [{}]
                },
            }
        },
        computed: {
            title () {
                return this.isNew() ? 'Create new workout program' : `Edit ${this.workoutProgram.name}`;
            }
        },
        methods: {
            async fetchWorkoutProgram() {
                const id = this.$route.params.id;

                if (id) {
                    this.workoutProgram = await WorkoutProgramService.get(id);
                }
            },
            isNew() {
                return !this.$route.params.id;
            }
        }
    }
</script>
