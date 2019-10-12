<template>
    <div>
        <loading-spinner v-if="loading"></loading-spinner>
        <title-input v-else :value="name" @input="updateName" :auto-grow="true"></title-input>

        <routine-card v-for="(routine, index) in workoutProgramRoutines" :key="index" :position="index"></routine-card>
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
