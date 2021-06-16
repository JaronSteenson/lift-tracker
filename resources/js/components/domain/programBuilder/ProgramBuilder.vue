<template>
    <div>
        <ProgramBuilderLoadingSkeleton v-if="loading"/>
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

                    <ServerSyncInfo
                        :status-message="saveStatusMessage"
                        :updatedAt="updatedAt"
                    />

                    <VMenu bottom left>
                        <template v-slot:activator="{ on }">
                            <VBtn icon v-on="on">
                                <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                            </VBtn>
                        </template>

                        <VList>
                            <VList-item @click="showArchiveConfirmation">
                                <VListItemTitle>Archive</VListItemTitle>
                            </VList-item>
                        </VList>
                    </VMenu>
                </VToolbar>

                <VSheet class="mx-3">
                    <Draggable
                        :forceFallback="true"
                        :delay="250"
                        :delayOnTouchOnly="true"
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
                                <VIcon left>{{ $svgIcons.mdiPlus }}</VIcon>
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
    import {mapActions, mapGetters, mapState} from 'vuex';
    import WorkoutCard from "./WorkoutCard";
    import NotFound from "../../routing/NotFound";
    import Draggable from 'vuedraggable';
    import EditableTitle from "../../formFields/EditableTitle";
    import ProgramBuilderLoadingSkeleton from "./ProgramBuilderLoadingSkeleton";
    import ServerSyncInfo from "../../ServerSyncInfo";

    export default {
        components: {
            ServerSyncInfo,
            WorkoutCard,
            NotFound,
            Draggable,
            EditableTitle,
            ProgramBuilderLoadingSkeleton,
        },
        props: {
            workoutProgramUuid: {
                type: String,
                required: false,
            }
        },
        async created() {
            if (!this.$route.params.workoutProgramUuid) {
                this.$store.dispatch('programBuilder/startNew')
                return;
            }

            this.loading = true;
            try {
                await this.$store.dispatch('programBuilder/fetch', this.workoutProgramUuid)
            } catch (e) {
                this.fetchError = true;
            }

            this.resetLocalState();
            this.loading = false;
        },
        data() {
            return {
                loading: false,
                fetchError: false,
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
                return !this.loading && this.fetchError;
            },
            ...mapState('programBuilder', ['updatedAt', 'uuid']),
            ...mapGetters('programBuilder', [
                'hasMadeSignificantChangesFromNew',
                'saveStatusMessage'
            ]),
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
        },
        methods: {
            ...mapActions('programBuilder', ['addWorkoutToProgram', 'archive']),
            async showArchiveConfirmation() {
                const archiveConfirmed = window.confirm('Are you sure you want to archive this program?');

                if (archiveConfirmed) {
                    await this.archive();
                    await this.$router.replace({ name: 'home' });
                }
            },
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
