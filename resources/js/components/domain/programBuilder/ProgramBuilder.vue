<template>
    <div>
        <LoadingSpinner v-if="loading"></LoadingSpinner>
        <div v-else class="d-flex justify-content-center">
            <VTextarea
                class="program-title"
                rows="2"
                :autofocus="!workoutProgramId"
                solo
                auto-grow
                placeholder="Enter program name"
                v-model="name"
            >
            </VTextarea>
        </div>

        <div class="container-fluid">
            <Draggable class="row" v-model="orderedWorkouts" handle=".js-workout-drag-handle" :forceFallback="true" dragClass="dragging-workout-card">
                <div v-for="(workout) in orderedWorkouts" class="col-sm-12 col-md-6 col-lg-4 col-xl-3 draggable">
                    <RoutineCard :key="workout.cid" :workoutCid="workout.cid"></RoutineCard>
                </div>

                <div slot="footer" class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                    <VCard draggable="false" class="add-another" @click.native="addWorkoutToProgram">
                        <AddButton draggable="false">Add workout</AddButton>
                    </VCard>
                </div>
            </Draggable>
        </div>
    </div>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import { mapState } from 'vuex';
    import RoutineCard from "./RoutineCard";
    import AddButton from "./../../formFields/AddButton";
    import Draggable from 'vuedraggable';

    export default {
        components: {
            AddButton,
            RoutineCard,
            LoadingSpinner,
            Draggable
        },
        props: {
            workoutProgramId: {
                type: String,
                required: false,
            }
        },
        created() {
            if (this.workoutProgramId) {
                this.$store.dispatch('programBuilder/fetchById', this.workoutProgramId)
            } else {
                this.$store.dispatch('programBuilder/tryRestoreFromLocalStorage');
            }
        },
        data() {
            return {
                loading: false,
            }
        },
        watch: {
            // Change the route to id once a new program has been saved
            id(newId, oldId) {
                if (!newId) {
                    return;
                }

                if (this.$route.params.workoutProgramId !== newId) {
                    this.$router.replace({ name: 'programBuilder', params: { workoutProgramId: newId }});
                }
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
        }
    }
</script>

<style scoped>
    .program-title {
        font-size: 2rem;
    }
    .add-another {
        text-align: center;
    }
</style>
