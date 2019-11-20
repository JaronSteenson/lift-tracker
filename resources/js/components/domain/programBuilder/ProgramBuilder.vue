<template>
    <div>
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <div v-else class="d-flex justify-content-center">
            <TitleInput class="program-title col-xs-12 col-md-8 col-lg-4" :placeholder="'Enter program name'" v-model="name"></TitleInput>
        </div>

        <div class="container-fluid">
            <Draggable class="row" v-model="orderedWorkouts" handle=".js-workout-drag-handle" :forceFallback="true" dragClass="dragging-workout-card">
                <div v-for="(workout) in orderedWorkouts" class="col-sm-12 col-md-6 col-lg-4 col-xl-3 draggable">
                    <RoutineCard :key="workout.cid" :workoutCid="workout.cid"></RoutineCard>
                </div>

                <div slot="footer" class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                    <BootstrapCard draggable="false" class="add-another" @click.native="addWorkoutToProgram">
                        <AddButton draggable="false">Add workout</AddButton>
                    </BootstrapCard>
                </div>
            </Draggable>
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
                this.$store.dispatch('programBuilder/tryRestoreFromLocalStorage');
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
            ...mapState('programBuilder', ['id']),
            orderedWorkouts: {
                get () {
                    return this.$store.getters['programBuilder/getOrderedWorkouts'];
                },
                set (orderedWorkouts) {
                    this.$store.dispatch('programBuilder/updateWorkoutPositionFromOrder', orderedWorkouts);
                },
            },
            name: {
                get () {
                    return this.$store.state.programBuilder.name || '';
                },
                set (name) {
                    this.$store.dispatch('programBuilder/updateName', name);
                },
            }
        },
        methods: {
            addWorkoutToProgram() {
                this.$store.dispatch('programBuilder/addWorkoutToProgram');
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
