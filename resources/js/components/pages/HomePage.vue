<template>
    <div v-if="userIsAuthenticated">
        <NoProgramsWelcomeHint v-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <ListPage v-else>
            <WorkoutSessionList />
            <template v-slot:fab>
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
            </template>
        </ListPage>
    </div>
</template>

<script>
import ListPage from '../layouts/ListPage';
import WorkoutSessionList from '../domain/WorkoutSessionList';
import { mapGetters } from 'vuex';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import NoSessionsHint from '../domain/userHints/NoSessionsHint';

export default {
    components: {
        NoSessionsHint,
        NoProgramsWelcomeHint,
        ListPage,
        WorkoutSessionList,
    },
    computed: {
        ...mapGetters('app', [
            'userIsAuthenticated',
            'shouldShowNoProgramsWelcomeHint',
            'shouldShowNoSessionsHint',
        ]),
        ...mapGetters('workoutSession', ['inProgressSet']),
    },
};
</script>
