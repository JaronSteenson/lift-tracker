<template>
    <div>
        <PageToolbar title="Start new session" :back-to="{ name: 'MyWorkoutSessionsPage' }" />
        <NoProgramsWelcomeHint
            v-if="shouldShowNoProgramsWelcomeHint"
        />
        <NoProgramsStartNewSessionHint
            v-else-if="shouldShowNoProgramsHintStartNewSession"
        />
        <ListPage
            v-else
            sub-title="Choose a routine to start"
        >
            <StartRoutineSelectionList/>
        </ListPage>
    </div>
</template>

<script>
import ListPage from '../layouts/ListPage';
import StartRoutineSelectionList from '../domain/StartRoutineSelectionList';
import NoProgramsStartNewSessionHint from '../domain/userHints/NoProgramsStartNewSessionHint';
import {mapGetters} from "vuex";
import NoProgramsWelcomeHint from "../domain/userHints/NoProgramsWelcomeHint";
import PageToolbar from "../layouts/PageToolbar";

export default {
    components: {
        PageToolbar,
        NoProgramsWelcomeHint,
        StartRoutineSelectionList,
        NoProgramsStartNewSessionHint,
        ListPage,
    },
    computed: {
        ...mapGetters('app',
            ['shouldShowNoProgramsWelcomeHint', 'shouldShowNoProgramsHintStartNewSession']),
    },
}
</script>
