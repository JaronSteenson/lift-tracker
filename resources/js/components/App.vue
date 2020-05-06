<template>
    <v-app>
        <v-navigation-drawer
            v-if="userIsAuthenticated"
            v-model="drawer"
            app
            :clipped="$vuetify.breakpoint.lgAndUp"
        >
            <v-list dense>
                <v-list-item link :to="{ name: 'home'}">
                    <v-list-item-action>
                        <VIcon>mdi-home</VIcon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Home</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <VAppBar app title color="primary" dark :clipped-left="$vuetify.breakpoint.lgAndUp">
            <VAppBarNavIcon v-if="userIsAuthenticated" @click.stop="drawer = !drawer" />
            <v-toolbar-title>{{ appName }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <VMenu
                v-if="userIsAuthenticated"
                transition="slide-y-transition"
                bottom
                offset-y
            >
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <v-avatar class="app-avatar">
                            <span class="accent--text headline">{{ avatarInitial }}</span>
                        </v-avatar>
                    </VBtn>
                </template>
                <v-list>
                    <v-list-item @click="logout">
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </VMenu>
        </VAppBar>

        <VContent>
            <RouterView v-if="hasLoaded"/>
            <AppSplashScreen v-else />
        </VContent>
    </v-app>
</template>


<script>
    import AppSplashScreen from './AppSplashScreen.vue';
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {
            AppSplashScreen
        },
        data() {
            return {
                drawer: null,
            }
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
                if (!this.userIsAuthenticated) {
                    this.$router.push({ name: 'login' });
                    return;
                }

                await this.$store.dispatch('app/logout');

                this.$router.push({ name: 'login' });
            }
        },
    }
</script>

<style lang="scss">
    .app-name {
        text-decoration: none;
        color: var(--v-accent-base) !important;
    }

    .app-avatar {
        background-color: var(--v-primary-lighten2);
    }

    .v-card {
       border: solid 1px var(--v-primary-base) !important;
    }

    .v-dialog {
        .v-card {
            border-width: 2px !important;
        }
    }
</style>
