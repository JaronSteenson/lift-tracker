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
                            :disabled="workoutSession.createdAt === null"
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
                        v-model="workoutSession.name"
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
                        v-model.number="workoutSession.bodyWeight"
                    />
                    <VTextarea
                        auto-grow
                        filled
                        label="Notes"
                        v-model="workoutSession.notes"
                    />
                    <VBtn
                        elevation="1"
                        width="100%"
                        type="submit"
                        :loading="saving"
                        >Save</VBtn
                    >
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
        return {
            saving: false,
            workoutSession: this.$route.params.workoutSessionUuid
                ? this.workoutSessionStore.workoutSession
                : createCheckIn(),
        };
    },
    methods: {
        async save() {
            this.saving = true;
            await this.workoutSessionStore.saveCheckIn(this.workoutSession);

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
            this.saving = false;
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
