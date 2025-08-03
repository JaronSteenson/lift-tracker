<template>
    <div>
        <PageAppBar :title="appName" show-drawer-icon />
        <SessionOverviewLoadingSkeleton v-if="myWorkoutSessionsIsLoading" />
        <NoProgramsWelcomeHint v-else-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <RecordsList v-else />
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
    </div>
</template>

<script>
import RecordsList from '../domain/RecordsList';
import { mapGetters, mapState } from 'vuex';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import NoSessionsHint from '../domain/userHints/NoSessionsHint';
import PageAppBar from '../AppBar';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton.vue';

export default {
    name: 'HomePage',
    components: {
        PageAppBar,
        SessionOverviewLoadingSkeleton,
        NoSessionsHint,
        NoProgramsWelcomeHint,
        RecordsList,
    },
    computed: {
        ...mapState('app', ['appName']),
        ...mapState('workoutSession', ['myWorkoutSessionsIsLoading']),
        ...mapGetters('app', [
            'shouldShowNoProgramsWelcomeHint',
            'shouldShowNoSessionsHint',
        ]),
        ...mapGetters('workoutSession', ['inProgressSet']),
    },
};
</script>
