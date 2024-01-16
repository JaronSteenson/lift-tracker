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
import { mapGetters } from 'vuex';

export default {
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
    computed: {
        ...mapGetters('app', ['userIsAuthenticated']),
    },
};
</script>

<style lang="scss"></style>
