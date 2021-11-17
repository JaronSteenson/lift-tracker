<template>
    <div v-if="true">
        <NoProgramsWelcomeHint
            v-if="shouldShowNoProgramsWelcomeHint"
        />
        <NoSessionsHint
            v-else-if="shouldShowNoSessionsHint"
        />
        <ListPage
            v-else
            sub-title="My workout sessions"
        >
            <WorkoutSessionList/>
            <template v-slot:fab>
                <VBtn
                    v-if="inProgressSet"
                    :to="{ name: 'SetOverviewPage', params: { sessionSetUuid: inProgressSet.uuid }}"
                    fab
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
import PageToolbar from "../layouts/PageToolbar";
import WorkoutSessionList from '../domain/WorkoutSessionList';
import {mapActions, mapGetters, mapState} from 'vuex';
import NoProgramsWelcomeHint from "../domain/userHints/NoProgramsWelcomeHint";
import NoSessionsHint from "../domain/userHints/NoSessionsHint";

export default {
    components: {
        NoSessionsHint,
        NoProgramsWelcomeHint,
        ListPage,
        PageToolbar,
        WorkoutSessionList,
    },
    computed: {
        ...mapGetters('app', ['userIsAuthenticated']),
        ...mapGetters('app',
            ['shouldShowNoProgramsWelcomeHint', 'shouldShowNoSessionsHint']),
        ...mapGetters('workoutSession',
            ['inProgressSet']
        ),
    },
}
</script>
