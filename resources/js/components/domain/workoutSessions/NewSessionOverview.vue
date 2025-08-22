<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading" />
        <div v-else>
            <NotFound v-if="notFound">
                Sorry we couldn't find that routine.
            </NotFound>
            <NarrowContentContainer v-else>
                <WorkoutCard
                    :workoutUuid="originRoutineUuid"
                    is-session-overview
                />
            </NarrowContentContainer>
        </div>
    </div>
</template>

<script>
import NotFound from '../../routing/NotFound';
import SessionOverviewLoadingSkeleton from './SessionOverviewLoadingSkeleton';
import WorkoutCard from './../programBuilder/WorkoutCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import { useProgramBuilderStore } from '../../../stores/programBuilder';

export default {
    components: {
        NarrowContentContainer,
        NotFound,
        SessionOverviewLoadingSkeleton,
        WorkoutCard,
    },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore };
    },
    props: {
        originRoutineUuid: String,
        workoutSessionUuid: String,
    },
    data() {
        return {
            loading: false,
            fetchError: false,
        };
    },
    async created() {
        if (this.originRoutineUuid) {
            this.loading = true;
            try {
                await this.programBuilderStore.prepareForSessionOverview(
                    this.originRoutineUuid,
                );
                this.loading = false;
            } catch (error) {
                this.fetchError = true;
                this.loading = false;
            }
        }
    },
    computed: {
        notFound() {
            return !this.loading && this.fetchError;
        },
    },
};
</script>

<style lang="scss"></style>
