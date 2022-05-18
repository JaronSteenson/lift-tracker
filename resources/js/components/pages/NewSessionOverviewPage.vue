<template>
    <div v-if="userIsAuthenticated">
        <PageToolbar
            title="Session overview"
            :back-to="{ name: 'NewSessionRoutineSelectPage' }"
        />
        <NewSessionOverview :originRoutineUuid="originRoutineUuid" />
    </div>
</template>

<script>
import NewSessionOverview from '../domain/workoutSessions/NewSessionOverview';
import PageToolbar from '../AppBar';
import { mapGetters } from 'vuex';

export default {
    components: {
        NewSessionOverview,
        PageToolbar,
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
