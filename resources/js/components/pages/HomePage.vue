<template>
    <div>
        <PageAppBar :title="appName" show-drawer-icon />
        <NoProgramsWelcomeHint v-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <WorkoutSessionList v-else />
        <VBtn
            v-if="inProgressSet"
            :to="{
                name: 'SetOverviewPage',
                params: { sessionSetUuid: inProgressSet.uuid },
            }"
            color="secondary"
            fixed
            right
            bottom
            title="Resume set"
            large
        >
            <span class="text--primary">Resume workout</span>
            <VIcon color="green" large>{{ $svgIcons.mdiPlayPause }}</VIcon>
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
import { mapGetters, mapState } from 'vuex';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import NoSessionsHint from '../domain/userHints/NoSessionsHint';
import PageAppBar from '../AppBar';

export default {
    name: 'HomePage',
    components: {
        PageAppBar,
        NoSessionsHint,
        NoProgramsWelcomeHint,
        WorkoutSessionList,
    },
    computed: {
        ...mapState('app', ['appName']),
        ...mapGetters('app', [
            'shouldShowNoProgramsWelcomeHint',
            'shouldShowNoSessionsHint',
        ]),
        ...mapGetters('workoutSession', ['inProgressSet']),
    },
};
</script>
