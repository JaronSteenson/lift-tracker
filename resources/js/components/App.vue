<template>
    <v-app>
        <VAppBar app title>
            <router-link :to="{ name: 'home'}" class="app-name">
                <v-toolbar-title>{{ appName }}</v-toolbar-title>
            </router-link>

            <v-spacer></v-spacer>

            <v-menu
                v-if="userIsAuthenticated"
                transition="slide-y-transition"
                bottom
                offset-y
            >
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                        <v-avatar color="accent">
                            <span class="white--text headline">{{ avatarInitial }}</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="logout">
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VAppBar>

        <v-content>
            <v-container>
                <LoadingSpinner v-if="!hasLoaded"></LoadingSpinner>
                <router-view v-else/>
            </v-container>
        </v-content>
    </v-app>
</template>


<script>
    import LoadingSpinner from './LoadingSpinner.vue';
    import { mapState, mapGetters, mapActions } from 'vuex';

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
                avatarInitial: 'getUserAvatarInitial',
                userIsAuthenticated: 'userIsAuthenticated',
            }),
        },
        methods: {
            async logout() {
                await this.$store.dispatch('app/logout');
                this.$router.push({ name: 'login' });
            }
        },
    }
</script>

<style lang="scss" scoped>
    .app-name {
        font-weight: bold;
        text-decoration: none;
        color: var(--v-primary-base);
    }
</style>
