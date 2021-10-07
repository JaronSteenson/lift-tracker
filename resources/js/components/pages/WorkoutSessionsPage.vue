<template>
    <NoProgramsWelcomeHint
        v-if="shouldShowNoProgramsWelcomeHint"
    />
    <NoSessionsHint
        v-else-if="shouldShowNoSessionsHint"
    />
    <ListPage
        v-else
        title="My workout sessions"
    >
        <slot>
            <WorkoutSessionList/>
        </slot>
        <template v-slot:fab>
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
import {mapActions, mapGetters, mapState} from 'vuex';
import NoProgramsWelcomeHint from "../domain/userHints/NoProgramsWelcomeHint";
import NoSessionsHint from "../domain/userHints/NoSessionsHint";

export default {
    components: {
        NoSessionsHint,
        NoProgramsWelcomeHint,
        ListPage,
        WorkoutSessionList,
    },
    computed: {
        ...mapGetters('app',
            ['shouldShowNoProgramsWelcomeHint', 'shouldShowNoSessionsHint']),
        ...mapGetters('workoutSession',
            ['inProgressSet']
        ),
    },
}
</script>
