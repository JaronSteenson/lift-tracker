<template>
    <div>
        <template v-if="loading">
            <VToolbar>
                <VSkeletonLoader type="heading" width="600px"/>
            </VToolbar>
            <VSheet class="mx-3">

                <VRow>
                    <VCol cols="12" lg="3" md="4" sm="6">
                        <VCard height="400px">
                            <VSkeletonLoader type="image@2" />
                        </VCard>
                    </VCol>
                    <VCol cols="12" lg="3" md="4" sm="6">
                        <VCard>
                            <VSkeletonLoader type="image" />
                        </VCard>
                    </VCol>
                    <VCol cols="12" lg="3" md="4" sm="6">
                        <VCard>
                            <VSkeletonLoader type="image@3" />
                        </VCard>
                    </VCol>
                    <VCol cols="12" lg="3" md="4" slot="footer" sm="6">
                        <VBtn width="100%" disabled>
                            <VSkeletonLoader type="image" height="400" />
                        </VBtn>
                    </VCol>
                </VRow>
            </VSheet>
        </template>
        <div v-else>
            <NotFound v-if="notFound">Sorry we couldn't find that program.</NotFound>
            <template v-else>
                <VToolbar>
                        <VTextField
                            class="program-builder-title"
                            :autofocus="editingName"
                            single-line
                            @blur="finishEditingName"
                            @keydown.enter="finishEditingName"
                            @keydown.esc="abortEditingName"
                            label="Program name"
                            v-if="editingName"
                            v-model="localState.name"
                            hide-details
                        >
                        </VTextField>
                        <VToolbarTitle v-else>
                            <EditableTitle @click="editingName = true">{{ nameForDisplay }}</EditableTitle>
                        </VToolbarTitle>
                        <VSpacer></VSpacer>

                    <VSubheader v-if="$vuetify.breakpoint.smAndUp">{{ statusMessage }}</VSubheader>


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
                </VToolbar>

                <VSheet class="mx-3">
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
                </VSheet>
            </template>
        </div>
    </div>
</template>

<script>
    import {mapState, mapActions, mapGetters} from 'vuex';
    import WorkoutCard from "./WorkoutCard";
    import NotFound from "../../routing/NotFound";
    import Draggable from 'vuedraggable';
    import EditableTitle from "../../formFields/EditableTitle";

    export default {
        components: {
            WorkoutCard,
            NotFound,
            Draggable,
            EditableTitle,
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
                this.resetLocalState();
                this.loading = false;
            }
        },
        data() {
            return {
                loading: false,
                editingName: false,
                localState: { name: this.$store.state.programBuilder.name },
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
            },
        },
        computed: {
            autofocus() {
                return !this.hasMadeSignificantChangesFromNew;
            },
            notFound() {
                return !this.loading && !this.uuid;
            },
            ...mapState('programBuilder', ['uuid', 'updatedAt']),
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
            },
            statusMessage() {
                if (this.savingStatusMessage) {
                    return this.savingStatusMessage;
                }

                return this.updatedAt ? `last updated ${this.updatedAt}` : '';
            }
        },
        methods: {
            ...mapActions('programBuilder', ['addWorkoutToProgram']),
            finishEditingName() {
                this.editingName = false;

                if (this.name !== this.localState.name) {
                    this.name = this.localState.name;
                }
            },
            abortEditingName() {
                this.localState.name = this.name;
                this.editingName = false;
            },
            resetLocalState() {
                this.localState = {name: this.$store.state.programBuilder.name};
            },
        }
    }
</script>

<style lang="scss" scoped>
    .program-builder-title {
        max-width: 390px;
    }

    .builder-workouts-container {
        padding: 10px;
    }
</style>
