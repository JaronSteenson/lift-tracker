<template>
    <div v-if="!loading">
        <NotFound v-if="notFound">Sorry we couldn't find that program.</NotFound>
        <div v-else>
            <v-toolbar flat>
                <VCardTitle v-if="editingName" class="mt-3">
                    <VTextField
                        :autofocus="editingName"
                        @blur="finishEditingName"
                        @keydown.enter="finishEditingName"
                        @keydown.esc="abortEditingName"
                        label="Program name"
                        v-model="localState.name"/>
                </VCardTitle>
                <v-toolbar-title v-else @click="editingName = true" role="button">{{ nameForDisplay }}</v-toolbar-title>

                <VBtn v-if="editingName" @click="abortEditingName" icon ref="abortNameEdit">
                    <VIcon>mdi-close</VIcon>
                </VBtn>

                <VMenu v-if="!editingName" bottom left>
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

                <v-spacer></v-spacer>

                <VSubheader>{{ savingStatusMessage || 'Last updated 1984' }}</VSubheader>

            </v-toolbar>
            <v-sheet class="mx-3">
                <Draggable
                    :forceFallback="true"
                    class="row"
                    dragClass="workout-drag"
                    ghostClass="workout-drop-placeholder"
                    handle=".js-workout-drag-handle"
                    v-model="orderedWorkouts">
                    <VCol :key="workout.uuid" cols="12" lg="3" md="4" sm="6"
                          v-for="(workout) in orderedWorkouts">
                        <WorkoutCard :workoutUuid="workout.uuid"></WorkoutCard>
                    </VCol>
                    <VCol cols="12" lg="3" md="4" slot="footer" sm="6">
                        <VBtn @click="addWorkoutToProgram(null)" draggable="false" width="100%">
                            <VIcon left>mdi-plus</VIcon>
                            Add workout
                        </VBtn>
                    </VCol>
                </Draggable>
            </v-sheet>
        </div>
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
        async created() {
            if (this.workoutProgramUuid) {
                this.loading = true;
                await this.$store.dispatch('programBuilder/fetch', this.workoutProgramUuid)
                this.loading = false;
            }
        },
        data() {
            return {
                loading: false,
                editingName: false,
                localState: {name: this.$store.state.programBuilder.name},
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
            ...mapGetters('programBuilder', ['hasMadeSignificantChangesFromNew', 'savingStatusMessage']),
            orderedWorkouts: {
                get() {
                    return this.$store.getters['programBuilder/getOrderedWorkouts'];
                },
                set(orderedWorkouts) {
                    this.$store.dispatch('programBuilder/updateWorkoutPositionFromOrder', orderedWorkouts);
                },
            },
            nameForDisplay() {
                return this.name || 'Unnamed program';
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
            ...mapActions('programBuilder', ['addWorkoutToProgram']),
            finishEditingName(e) {
                // Allow canceling addition of element by clicking the cancel cross.
                if (e.relatedTarget === this.$refs.abortNameEdit.$el) {
                    this.abortEditingName();
                    return;
                }

                this.editingName = false;
                this.name = this.localState.name;
            },
            abortEditingName() {
                this.localState.name = this.name;
                this.editingName = false;
            },
        }
    }
</script>

<style lang="scss" scoped>
    .builder-workouts-container {
        padding: 10px;
    }
</style>
