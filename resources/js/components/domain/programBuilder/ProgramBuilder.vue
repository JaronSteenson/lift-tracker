<template>
    <div>
        <loading-spinner v-if="loading"></loading-spinner>
        <div v-else class="d-flex justify-content-center">
            <title-input class="program-title col-xs-12 col-md-8 col-lg-4" :placeholder="'Enter program name'" :initial-value="name" @input="updateName"></title-input>
        </div>

        <div class="container">
            <template v-for="(routine, index) in workoutProgramRoutines">
                <div class="col-sm-4">
                    <routine-card :key="index" :position="index"></routine-card>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import { mapState } from 'vuex';
    import TitleInput from "../../formFields/TitleInput";
    import RoutineCard from "./RoutineCard";

    export default {
        name: 'ProgramBuilder',
        components: { RoutineCard, TitleInput, LoadingSpinner },
        props: {
            workoutProgramId: {
                type: String,
                required: false,
            }
        },
        created() {
            if (!this.workoutProgramId) {
                this.$store.dispatch('programBuilder/startNew');
            } else {
                // TODO go fetch existing.
            }
        },
        data () {
            return {
                loading: false,
            }
        },
        computed: {
            ...mapState('programBuilder', ['id', 'name', 'workoutProgramRoutines']),
        },
        methods: {
            addWorkoutToProgram() {
                // this.$store.dispatch('programBuilder/addWorkoutToProgram', null, { root: true } );
                this.$store.dispatch('programBuilder/addWorkoutToProgram');
            },

            updateName(e) {
                this.$store.dispatch('programBuilder/updateName', e.target.value);
            },

            async save() {
                this.loading = true;
                // await WorkoutProgramService.save(this.workoutProgram); TODO move to store
                this.loading = false;
            },
        }
    }
</script>

<style scoped>
</style>
