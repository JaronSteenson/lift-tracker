<template>
    <div>
        <VContainer class="px-0" fluid>
            <VRow class="no-gutters">
                <VCol cols="12" lg="3" md="4" sm="6">
                    <VTextField
                        v-model="name"
                        class="mx-4"
                        :autofocus="autofocus"
                        flat
                        hide-details
                        label="Program name"
                    >
                        <template slot="append-outer">
                            <VMenu bottom left>
                                <template v-slot:activator="{ on }">
                                    <VBtn icon v-on="on">
                                        <VIcon>mdi-dots-vertical</VIcon>
                                    </VBtn>
                                </template>

                                <VList>
                                    <VList-item @click="showDeleteConfimation = true">
                                        <VListItemTitle>Delete</VListItemTitle>
                                    </VList-item>
                                </VList>
                            </VMenu>
                        </template>
                    </VTextField>
                </VCol>
            </VRow>
        </VContainer>
        <Draggable :forceFallback="true" class="row"
                   dragClass="workout-drag"
                   ghostClass="workout-drop-placeholder"
                   handle=".js-workout-drag-handle"
                   v-model="orderedWorkouts">
            <VCol :key="workout.uuid" cols="12" lg="3" md="4" sm="6" v-for="(workout) in orderedWorkouts">
                <WorkoutCard :workoutUuid="workout.uuid"></WorkoutCard>
            </VCol>
            <VCol cols="12" lg="3" md="4" sm="6" slot="footer">
                <VBtn @click="addWorkoutToProgram(null)" draggable="false" width="100%">
                    <VIcon left>mdi-plus</VIcon>
                    Add workout
                </VBtn>
            </VCol>
        </Draggable>
    </div>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import {mapState, mapActions, mapGetters} from 'vuex';
    import WorkoutCard from "./WorkoutCard";
    import Draggable from 'vuedraggable';

    export default {
        components: {
            WorkoutCard,
            LoadingSpinner,
            Draggable
        },
        props: {
            workoutProgramUuid: {
                type: String,
                required: false,
            }
        },
        created() {
            if (this.workoutProgramUuid) {
                this.$store.dispatch('programBuilder/fetch', this.workoutProgramUuid)
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
            // Change the route to id once a new program has been assigned a uuid.
            uuid(newUuid) {
                if (!newUuid) {
                    return;
                }

                if (this.$route.params.workoutProgramUuid !== newUuid) {
                    this.$router.replace({name: 'programBuilder', params: {workoutProgramUuid: newUuid}});
                }
            }
        },
        computed: {
            autofocus() {
                return !this.hasMadeSignificantChangesFromNew;
            },
            ...mapState('programBuilder', ['uuid']),
            ...mapGetters('programBuilder', ['hasMadeSignificantChangesFromNew']),
            orderedWorkouts: {
                get() {
                    return this.$store.getters['programBuilder/getOrderedWorkouts'];
                },
                set(orderedWorkouts) {
                    this.$store.dispatch('programBuilder/updateWorkoutPositionFromOrder', orderedWorkouts);
                },
            },
            name: {
                get() {
                    return this.$store.state.programBuilder.name;
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateName', name);
                },
            }
        },
        methods: {
            ...mapActions('programBuilder', ['addWorkoutToProgram'])
        }
    }
</script>

<style lang="scss" scoped>
    .builder-workouts-container {
        padding: 10px;
    }
</style>
