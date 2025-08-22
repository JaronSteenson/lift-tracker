<template>
    <div>
        <AppBar title="Start new session" :back-to="{ name: 'HomePage' }" />
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
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import AppBar from '../AppBar';
import { useAppStore } from '../../stores/app';

export default {
    name: 'NewSessionRoutineSelectPage',
    components: {
        AppBar,
        NoProgramsWelcomeHint,
        StartRoutineSelectionList,
        NoProgramsStartNewSessionHint,
    },
    setup() {
        const appStore = useAppStore();
        return { appStore };
    },
    computed: {
        shouldShowNoProgramsWelcomeHint() {
            return this.appStore.shouldShowNoProgramsWelcomeHint;
        },
        shouldShowNoProgramsHintStartNewSession() {
            return this.appStore.shouldShowNoProgramsHintStartNewSession;
        },
    },
};
</script>
