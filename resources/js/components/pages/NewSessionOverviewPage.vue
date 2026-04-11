<template>
    <div v-if="userIsAuthenticated">
        <AppBar
            title="Session overview"
            :back-to="{ name: 'NewSessionRoutineSelectPage' }"
        />
        <NewSessionOverview :originRoutineUuid="originRoutineUuid" />
    </div>
</template>

<script>
import NewSessionOverview from '../domain/workoutSessions/NewSessionOverview';
import AppBar from '../AppBar';
import { useAuth } from '../domain/auth/composables/useAuth';

export default {
    name: 'NewSessionOverviewPage',
    components: {
        NewSessionOverview,
        AppBar,
    },
    props: {
        originRoutineUuid: {
            type: String,
            required: true,
        },
    },
    setup() {
        const { userIsAuthenticated } = useAuth();
        return { userIsAuthenticated };
    },
};
</script>

<style lang="scss"></style>
