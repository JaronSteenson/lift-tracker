<template>
    <div>
        <ProgramBuilderLoadingSkeleton v-if="loading"/>
        <div v-else>
            <NotFoundPage v-if="notFound">Sorry we couldn't find that program.</NotFoundPage>
            <template v-else>
                <PageToolbar
                    :title="$vuetify.breakpoint.smAndDown ? 'Program builder' : null"
                    :back-to="{ name: 'MyWorkoutProgramsPage' }"
                >
                    <template v-if="$vuetify.breakpoint.mdAndUp" v-slot:middle>
                        <VTextField
                            v-if="editingName"
                            class="program-builder-title"
                            v-model="localState.name"
                            :autofocus="editingName"
                            label="Program name"
                            hide-details
                            single-line
                            @blur="finishEditingName"
                            @keydown.enter="finishEditingName"
                            @keydown.esc="abortEditingName"
                        >
                        </VTextField>
                        <VToolbarTitle v-else>
                            <EditableTitle @click="editingName = true">{{ nameForDisplay }}</EditableTitle>
                        </VToolbarTitle>
                    </template>
                    <template v-slot:right>
                        <ServerSyncInfo
                            :status-message="saveStatusMessage"
                            :updatedAt="inFocusProgram.updatedAt"
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
                    </template>
                </PageToolbar>

                <VSheet class="mx-3">
                    <VTextField
                        v-if="$vuetify.breakpoint.smAndDown"
                        v-model="localState.name"
                        :autofocus="editingName"
                        single-line
                        hide-details
                        @blur="finishEditingName"
                        @keydown.enter="finishEditingName"
                        @keydown.esc="abortEditingName"
                        label="Program name"
                    />

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
    import NotFoundPage from "../../pages/NotFoundPage";
    import Draggable from 'vuedraggable';
    import EditableTitle from "../../formFields/EditableTitle";
    import ProgramBuilderLoadingSkeleton from "./ProgramBuilderLoadingSkeleton";
    import ServerSyncInfo from "../../ServerSyncInfo";
    import PageToolbar from "../../layouts/PageToolbar";

    export default {
        components: {
            ServerSyncInfo,
            WorkoutCard,
            NotFoundPage,
            Draggable,
            EditableTitle,
            PageToolbar,
            ProgramBuilderLoadingSkeleton,
        },
        props: {
            workoutProgramUuid: {
                type: String,
                required: false,
            }
        },
        async created() {
            await this.loadProgram();
        },
      data() {
            return {
                loading: false,
                fetchError: false,
                editingName: false,
                localState: { name: this.$store.state.programBuilder.inFocusProgram.name },
            }
        },
        watch: {
            workoutProgramUuid() {
              if (this.workoutProgramUuid !== this.uuid) {
                this.loadProgram();
              }
            },
            uuid(newUuid) {
              // Started as a new builder (workoutProgramUuid prop), but has now bee assigned a uuid and saved (val).
              if (!this.workoutProgramUuid && newUuid) {
                this.$router.replace({ name: 'ProgramBuilderPage', params: { workoutProgramUuid: newUuid }});
              }
            }
          },
        computed: {
            notFound() {
                return !this.loading && this.fetchError;
            },
            ...mapState('programBuilder', ['inFocusProgram']),
            ...mapGetters('programBuilder', [
                'hasMadeSignificantChangesFromNew',
                'saveStatusMessage'
            ]),
            uuid() {
                return this.inFocusProgram.uuid;
            },
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
                    return this.$store.state.programBuilder.inFocusProgram.name;
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateName', name);
                },
            },
        },
        methods: {
            ...mapActions('programBuilder', ['addWorkoutToProgram', 'archive']),
          async loadProgram() {
              if (!this.workoutProgramUuid) {
                await this.$store.dispatch('programBuilder/startNew')
                this.resetLocalState();
                return;
              }

              this.loading = true;
              try {
                await this.$store.dispatch('programBuilder/fetch', this.workoutProgramUuid)
                this.resetLocalState();
              } catch (e) {
                this.fetchError = true;
              }
              this.loading = false;
            },
            async showArchiveConfirmation() {
                const archiveConfirmed = window.confirm('Are you sure you want to archive this program?');

                if (archiveConfirmed) {
                    await this.archive();
                    await this.$router.push({ name: 'MyWorkoutProgramsPage' });
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
                this.localState = { name: this.$store.state.programBuilder.inFocusProgram.name };
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
