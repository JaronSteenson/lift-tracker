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
                    <template v-slot:activator="{ on }">
                        <VBtn icon v-on="on">
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
            <VBtn @click="save">Save</VBtn>
        </NarrowContentContainer>
    </div>
</template>

<script>
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import { createCheckIn } from '../../../domain/createSessionFromBuilderWorkout';

export default {
    components: {
        NarrowContentContainer,
        AppBar,
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

        const workoutSession =
            this.$store.getters['workoutSession/workoutSession'];
        return {
            uuid: workoutSession.uuid,
            name: workoutSession.name,
            bodyWeight: workoutSession.bodyWeight,
            notes: workoutSession.notes,
            createdAt: workoutSession.createdAt,
            sessionExercises: workoutSession.sessionExercises,
            workoutProgramRoutine: workoutSession.workoutProgramRoutine,
        };
    },
    methods: {
        async save() {
            await this.$store.dispatch('workoutSession/saveCheckIn', {
                uuid: this.uuid,
                name: this.name,
                bodyWeight: this.bodyWeight,
                notes: this.notes,
                sessionExercises: this.sessionExercises,
                workoutProgramRoutine: this.workoutProgramRoutine,
            });
            const workoutSession =
                this.$store.getters['workoutSession/workoutSession'];

            if (this.toFirstSetAfterSave) {
                const firstSet = this.$store.getters['workoutSession/firstSet'];
                await this.$router.push({
                    name: 'SetOverviewPage',
                    params: { sessionSetUuid: firstSet.uuid },
                });
                return;
            }

            await this.$router.push({
                name: 'SessionOverviewPage',
                params: { workoutSessionUuid: workoutSession.uuid },
            });
        },
        showDeleteConfirmation() {
            const deleteConfirmed = window.confirm(
                'Are you sure you want to delete this record?'
            );

            if (deleteConfirmed) {
                this.$store.dispatch(
                    'workoutSession/delete',
                    this.workoutSession.uuid
                );
                this.$router.replace({ name: 'HomePage' });
            }
        },
    },
};
</script>
