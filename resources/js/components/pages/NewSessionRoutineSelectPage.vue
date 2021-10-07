<template>
    <NoProgramsWelcomeHint
        v-if="shouldShowNoProgramsWelcomeHint"
    />
    <NoProgramsStartNewSessionHint
        v-else-if="shouldShowNoProgramsHintStartNewSession"
    />
    <ListPage
        v-else
        title="Choose a routine to start"
    >
        <slot>
            <StartRoutineSelectionList/>
        </slot>
    </ListPage>
</template>

<script>
import ListPage from '../layouts/ListPage';
import StartRoutineSelectionList from '../domain/StartRoutineSelectionList';
import NoProgramsStartNewSessionHint from '../domain/userHints/NoProgramsStartNewSessionHint';
import {mapGetters} from "vuex";
import NoProgramsWelcomeHint from "../domain/userHints/NoProgramsWelcomeHint";

export default {
    components: {
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
