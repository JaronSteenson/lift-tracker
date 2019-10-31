<template>
    <div>
        <loading-spinner v-if="loading"></loading-spinner>
        <div v-else class="d-flex justify-content-center">
            <title-input class="program-title col-xs-12 col-md-8 col-lg-4" :placeholder="'Enter program name'" :initial-value="name" @input="updateName"></title-input>
        </div>

        <div class="container-fluid">
            <div class="row">
                <template v-for="(routine) in workoutProgramRoutines">
                    <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                        <routine-card :key="routine.cid" :workoutCid="routine.cid"></routine-card>
                    </div>
                </template>

                <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                    <bootstrap-card class="add-another" @click.native="addWorkoutToProgram">
                        <i class="fa fa-plus"></i> Add another workout
                    </bootstrap-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import { mapState } from 'vuex';
    import TitleInput from "../../formFields/TitleInput";
    import RoutineCard from "./RoutineCard";
    import BootstrapCard from "./../../BootstrapCard";

    export default {
        name: 'ProgramBuilder',
        components: { RoutineCard, TitleInput, LoadingSpinner, BootstrapCard },
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
                this.$store.dispatch('programBuilder/addWorkoutToProgram');
                // this.$store.dispatch('programBuilder/addWorkoutToProgram');
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
    .program-title {
        height: 42px;
        font-size: 24px;
    }
    .add-another {
        opacity: 0.75;
        cursor: pointer;
        text-align: center;
    }
</style>
