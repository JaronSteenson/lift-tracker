<template>
    <div>
        <NotFound v-if="notFound">Sorry we couldn't find that program.</NotFound>
        <template v-else>
            <VContainer class="px-0" fluid>
                <VRow class="no-gutters">
                    <VCol cols="12" lg="3" md="4" sm="6">
                        <VTextField
                            :autofocus="autofocus"
                            class="mx-4"
                            flat
                            hide-details
                            label="Program name"
                            v-model="name"
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
                <VCol cols="12" lg="3" md="4" slot="footer" sm="6">
                    <VBtn @click="addWorkoutToProgram(null)" draggable="false" width="100%">
                        <VIcon left>mdi-plus</VIcon>
                        Add workout
                    </VBtn>
                </VCol>
            </Draggable>
        </template>
    </div>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import {mapState, mapActions, mapGetters} from 'vuex';
    import WorkoutCard from "./WorkoutCard";
    import NotFound from "../../routing/NotFound";
    import Draggable from 'vuedraggable';

    export default {
        components: {
            WorkoutCard,
            LoadingSpinner,
            NotFound,
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
            notFound() {
                return !this.loading && !this.uuid;
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
