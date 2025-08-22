<template>
    <div>
        <AppBar
            :title="pageTitle"
            :back-to="
                $route.params.workoutSessionUuid
                    ? {
                          name: 'SessionOverviewPage',
                          params: {
                              workoutSessionUuid:
                                  $route.params.workoutSessionUuid,
                          },
                      }
                    : { name: 'HomePage' }
            "
        >
            <template v-slot:right>
                <VMenu bottom left>
                    <template v-slot:activator="{ props }">
                        <VBtn icon flat v-bind="props">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :disabled="createdAt === null"
                            @click="showDeleteConfirmation"
                        >
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </AppBar>

        <NarrowContentContainer>
            <VContainer class="py-0">
                <VForm @submit.prevent="save">
                    <VTextField
                        class=""
                        v-model="name"
                        label="Title"
                        hide-details
                        single-line
                    />
                    <VTextField
                        class=""
                        autofocus
                        label="Body weight (kg)"
                        type="number"
                        :step="1"
                        :max="9999"
                        :min="0"
                        v-model.number="bodyWeight"
                    />
                    <VTextarea auto-grow filled label="Notes" v-model="notes" />
                    <VBtn elevation="1" width="100%" type="submit">Save</VBtn>
                </VForm>
            </VContainer>
        </NarrowContentContainer>
    </div>
</template>

<script>
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import { createCheckIn } from '../../../domain/createSessionFromBuilderWorkout';
import { useWorkoutSessionStore } from '../../../stores/workoutSession';
import { svgIcons } from '../../../vuetify';

export default {
    components: {
        NarrowContentContainer,
        AppBar,
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        return { workoutSessionStore, svgIcons };
    },
    props: {
        toFirstSetAfterSave: Boolean,
    },
    computed: {
        pageTitle() {
            return this.$route.params.workoutSessionUuid
                ? 'Edit check-in'
                : 'New check-in';
        },
    },
    data() {
        if (!this.$route.params.workoutSessionUuid) {
            return createCheckIn();
        }

        return {
            uuid: null,
            name: null,
            bodyWeight: null,
            notes: null,
            createdAt: null,
            sessionExercises: [],
            workoutProgramRoutine: null,
        };
    },
    created() {
        if (this.$route.params.workoutSessionUuid) {
            this.loadWorkoutSession();
        }
    },
    methods: {
        loadWorkoutSession() {
            const workoutSession =
                this.workoutSessionStore.workoutSession || {};
            this.uuid = workoutSession.uuid;
            this.name = workoutSession.name;
            this.bodyWeight = workoutSession.bodyWeight;
            this.notes = workoutSession.notes;
            this.createdAt = workoutSession.createdAt;
            this.sessionExercises = workoutSession.sessionExercises || [];
            this.workoutProgramRoutine = workoutSession.workoutProgramRoutine;
        },
        async save() {
            await this.workoutSessionStore.saveCheckIn({
                uuid: this.uuid,
                name: this.name,
                bodyWeight: this.bodyWeight,
                notes: this.notes,
                sessionExercises: this.sessionExercises,
                workoutProgramRoutine: this.workoutProgramRoutine,
            });

            const workoutSession = this.workoutSessionStore.workoutSession;
            if (this.toFirstSetAfterSave) {
                const firstSet = this.workoutSessionStore.firstSet;
                await this.$router.push({
                    name: 'SetOverviewPage',
                    params: {
                        sessionSetUuid: firstSet.uuid,
                        fromCheckIn: true,
                    },
                });
                return;
            }

            await this.$router.push({
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: workoutSession.uuid },
            });
        },
        async showDeleteConfirmation() {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this record?',
            );

            if (deleteConfirmed) {
                await this.workoutSessionStore.delete(this.uuid);
                this.$router.replace({ name: 'HomePage' });
            }
        },
    },
};
</script>
