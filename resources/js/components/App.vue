<template>
    <VApp>
        <VNavigationDrawer
            v-if="userIsAuthenticated"
            v-model="drawer"
            app
            :clipped="$vuetify.breakpoint.lgAndUp"
        >
            <VList dense>
                <VListItem
                    link
                    :to="{ path: '/'}"
                 >
                    <VListItemIcon>
                        <VIcon>mdi-home</VIcon>
                    </VListItemIcon>

                    <VListItemContent>
                        <VListItemTitle>Home</VListItemTitle>
                    </VListItemContent>
                </VListItem>

                <VDivider/>

                <VListItem
                    v-for="workout in inProgressWorkouts"
                    :key="workout.uuid"
                    link
                    :to="{ name: 'sessionOverview', params: { workoutSessionUuid: workout.uuid } }"
                >
                    <VListItemAction>
                        <VIcon>mdi-dumbbell</VIcon>
                    </VListItemAction>
                    <VListItemContent>
                        <VListItemTitle>Resume workout</VListItemTitle>
                        <VListItemSubtitle>{{ workout.name }}</VListItemSubtitle>
                    </VListItemContent>
                </VListItem>
            </VList>
        </VNavigationDrawer>

        <VAppBar app title color="primary" dark :clipped-left="$vuetify.breakpoint.lgAndUp">
            <VAppBarNavIcon v-if="userIsAuthenticated" @click.stop="drawer = !drawer" />
            <VToolbarTitle>{{ appName }}</VToolbarTitle>

            <VSpacer/>

            <VMenu
                v-if="userIsAuthenticated"
                transition="slide-y-transition"
                bottom
                offset-y
            >
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VAvatar class="app-avatar">
                            <span class="accent--text headline">{{ avatarInitial }}</span>
                        </VAvatar>
                    </VBtn>
                </template>
                <VList>
                    <VListItem @click="logout">
                        <VListItemTitle>Logout</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </VAppBar>

        <VContent>
            <VFadeTransition v-if="hasLoaded" leave-absolute>
                <RouterView/>
            </VFadeTransition>
            <AppSplashScreen v-else-if="slowLoading"/>
        </VContent>
    </VApp>
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
                'slowLoading',
                'appName',
                'authenticatedUser'
            ]),
            ...mapGetters('app', {
                avatarInitial: 'getUserAvatarInitial',
                userIsAuthenticated: 'userIsAuthenticated',
            }),
            ...mapGetters('workoutSession',
                ['hasLoadedInProgressWorkouts', 'inProgressWorkouts']
            ),
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

    .theme--light.v-icon {
        color: var(--v-primary-base);
    }
</style>
