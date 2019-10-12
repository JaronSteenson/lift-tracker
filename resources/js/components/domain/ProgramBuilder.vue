<template class="program-builder">
    <loading-spinner v-if="loading"></loading-spinner>
    <input v-else class="program-builder__name" :value="name" @input="updateName">
</template>

<script>
    import WorkoutRoutineForm from "../domain/WorkoutRoutineForm";
    import LoadingSpinner from "../LoadingSpinner";
    import { mapState } from 'vuex'

    export default {
        name: 'ProgramBuilder',
        components: {LoadingSpinner, WorkoutRoutineForm},
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
    .program-builder__name {
        border: none;
        border-bottom: solid 3px #524f52;
        background: none;
        min-height: 30px;
        min-width: 300px;
        font-size: 20px;
    }

    .program-builder__name:focus {
        border: none;
        border-bottom: solid 3px #524f52;
        outline: none;
        box-shadow: none !important;
    }
</style>
