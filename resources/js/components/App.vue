<template>
    <v-app>
        <v-navigation-drawer app>
        </v-navigation-drawer>

        <v-app-bar app title>
            <v-toolbar-title>{{ appName }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-menu
                transition="slide-y-transition"
                bottom
                offset-y
            >
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                        <v-avatar color="purple">
                            <span class="white--text headline">{{ avatarInitial }}</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item>
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-content>
            <v-container fluid>
                <LoadingSpinner v-if="!hasLoaded"></LoadingSpinner>
                <router-view v-else/>
            </v-container>
        </v-content>
    </v-app>
</template>


<script>
    import LoadingSpinner from './LoadingSpinner.vue';
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {
            LoadingSpinner
        },
        mounted() {
            this.$store.dispatch('app/fetchAppBootstrapData');
        },
        computed: {
            ...mapState('app', [
                'hasLoaded',
                'appName',
                'authenticatedUser'
            ]),
            ...mapGetters('app', {
                avatarInitial: 'getUserAvatarInitial'
            }),
        },
    }
</script>
