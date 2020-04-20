<template>


    <v-container
        class="grey lighten-4"
        fluid
    >

        <v-row>
            <v-col cols="12" lg="3" md="4" sm="6">
                <VTextField
                    :autofocus="autofocus"
                    label="Program name"
                    placeholder="Enter program name"
                    v-model="name"
                />
            </v-col>
        </v-row>

        <v-row>
            <Draggable :forceFallback="true" class="row"
                       dragClass="workout-drag"
                       ghostClass="workout-drop-placeholder"
                       handle=".js-workout-drag-handle"
                       v-model="orderedWorkouts">
                <v-col cols="12" lg="3" md="4" sm="6" v-for="(workout) in orderedWorkouts" :key="workout.uuid">
                    <WorkoutCard :workoutUuid="workout.uuid"></WorkoutCard>
                </v-col>
                <v-col cols="12" lg="3" md="4" slot="footer" sm="6">
                        <v-btn draggable="false" width="100%" @click="addWorkoutToProgram(null)">
                            <v-icon left>mdi-plus</v-icon> Add workout
                        </v-btn>
                </v-col>
            </Draggable>
        </v-row>
    </v-container>
</template>

<script>
    import LoadingSpinner from "../../LoadingSpinner";
    import { mapState, mapActions, mapGetters } from 'vuex';
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
                    this.$router.replace({ name: 'programBuilder', params: { workoutProgramUuid: newUuid }});
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
