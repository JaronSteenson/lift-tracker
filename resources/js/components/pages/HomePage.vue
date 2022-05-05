<template>
    <div>
        <NoProgramsWelcomeHint v-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <WorkoutSessionList v-else />
        <VBtn
            v-if="inProgressSet"
            :to="{
                name: 'SetOverviewPage',
                params: { sessionSetUuid: inProgressSet.uuid },
            }"
            fab
            color="secondary"
            fixed
            right
            bottom
            title="Resume set"
        >
            <VIcon color="green">{{ $svgIcons.mdiPlay }}</VIcon>
        </VBtn>
        <VBtn
            v-else
            :to="{ name: 'NewSessionRoutineSelectPage' }"
            fab
            color="secondary"
            fixed
            right
            bottom
            title="Start new session"
        >
            <VIcon color="primary">{{ $svgIcons.mdiPlay }}</VIcon>
        </VBtn>
    </div>
</template>

<script>
import WorkoutSessionList from '../domain/WorkoutSessionList';
import { mapGetters } from 'vuex';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import NoSessionsHint from '../domain/userHints/NoSessionsHint';

export default {
    components: {
        NoSessionsHint,
        NoProgramsWelcomeHint,
        WorkoutSessionList,
    },
    computed: {
        ...mapGetters('app', [
            'shouldShowNoProgramsWelcomeHint',
            'shouldShowNoSessionsHint',
        ]),
        ...mapGetters('workoutSession', ['inProgressSet']),
    },
};
</script>
