<template>
    <ListPage title="My workout sessions">
        <slot>
            <WorkoutSessionList/>
        </slot>
        <template v-if="hasLoadedInProgressWorkouts"  v-slot:fab>
            <VBtn
                v-if="inProgressSet"
                :to="{ name: 'setOverview', params: { sessionSetUuid: inProgressSet.uuid }}"
                fab
                fixed
                right
                bottom
            >
                <VIcon color="green">{{ $svgIcons.mdiPlay }}</VIcon>
            </VBtn>
            <VBtn
                v-else
                :to="{ name: 'newSessionRoutineSelect' }"
                fab
                fixed
                right
                bottom
            >
                <VIcon color="primary">{{ $svgIcons.mdiPlay }}</VIcon>
            </VBtn>
        </template>
    </ListPage>
</template>

<script>
import ListPage from '../layouts/ListPage';
import WorkoutSessionList from '../domain/WorkoutSessionList';
import { mapGetters } from 'vuex';

export default {
    components: {
        ListPage,
        WorkoutSessionList ,
    },
    computed: {
        ...mapGetters('workoutSession',
            ['hasLoadedInProgressWorkouts', 'inProgressWorkouts']
        ),
        inProgressSet() {
            if (this.inProgressWorkouts.length === 0) {
                return null;
            }

            return this.$store.getters['workoutSession/currentSetForInProgressWorkout'](this.inProgressWorkouts[0].uuid);
        },
    },
}
</script>
