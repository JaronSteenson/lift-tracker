<template>
    <div>
        <PageToolbar
            title="Start new session"
            :back-to="{ name: 'HomePage' }"
        />
        <NoProgramsWelcomeHint v-if="shouldShowNoProgramsWelcomeHint" />
        <NoProgramsStartNewSessionHint
            v-else-if="shouldShowNoProgramsHintStartNewSession"
        />
        <StartRoutineSelectionList />
    </div>
</template>

<script>
import StartRoutineSelectionList from '../domain/StartRoutineSelectionList';
import NoProgramsStartNewSessionHint from '../domain/userHints/NoProgramsStartNewSessionHint';
import { mapGetters } from 'vuex';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import PageToolbar from '../AppBar';

export default {
    components: {
        PageToolbar,
        NoProgramsWelcomeHint,
        StartRoutineSelectionList,
        NoProgramsStartNewSessionHint,
    },
    computed: {
        ...mapGetters('app', [
            'shouldShowNoProgramsWelcomeHint',
            'shouldShowNoProgramsHintStartNewSession',
        ]),
    },
};
</script>
