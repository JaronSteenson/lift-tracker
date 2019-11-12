<template>
    <div>
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <div v-else class="d-flex justify-content-center">
            <TitleInput class="program-title col-xs-12 col-md-8 col-lg-4" :placeholder="'Enter program name'" :initial-value="name" @input="updateName"></TitleInput>
        </div>

        <div class="container-fluid">
            <div class="row">
                <template v-for="(routine) in workoutProgramRoutines">
                    <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                        <RoutineCard :key="routine.cid" :workoutCid="routine.cid"></RoutineCard>
                    </div>
                </template>

                <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                    <BootstrapCard class="add-another" @click.native="addWorkoutToProgram">
                        <AddButton>Add workout</AddButton>
                    </BootstrapCard>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import {mapState} from 'vuex';
    import TitleInput from "../../formFields/TitleInput";
    import RoutineCard from "./RoutineCard";
    import BootstrapCard from "./../../BootstrapCard";
    import AddButton from "./../../formFields/AddButton";
    import Draggable from 'vuedraggable';

    export default {
        name: 'ProgramBuilder',
        components: { AddButton, RoutineCard, TitleInput, LoadingSpinner, BootstrapCard, Draggable },
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
        text-align: center;
    }
</style>
