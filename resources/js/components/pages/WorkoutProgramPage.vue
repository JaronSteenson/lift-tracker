<template>
    <ProgramBuilder></ProgramBuilder>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import ProgramBuilder from "../domain/ProgramBuilder";
    import LoadingSpinner from "../LoadingSpinner";
    import { mapState } from 'vuex'

    export default {
        name: 'CreateWorkoutProgramPage',
        components: {ProgramBuilder, BootstrapCard, LoadingSpinner },
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
