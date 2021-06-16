<template>
    <VApp :class="{ 'prevent-text-select': preventTextSelect }">
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
                        <VIcon>{{ $svgIcons.mdiHome }}</VIcon>
                    </VListItemIcon>

                    <VListItemContent>
                        <VListItemTitle>Home</VListItemTitle>
                    </VListItemContent>
                </VListItem>

                <VDivider/>

                <div
                    :key="workout.uuid"
                    v-for="workout in inProgressWorkouts"
                >
                    <VListItem
                        :key="workout.uuid"
                        link
                        :to="{ name: 'sessionOverview', params: { workoutSessionUuid: workout.uuid } }"
                    >
                        <VListItemAction>
                            <VIcon color="success">{{ $svgIcons.mdiFormatListBulletedTriangle }}</VIcon>
                        </VListItemAction>
                        <VListItemContent>
                            <VListItemTitle v-if="workoutIsInFocus(workout.uuid)">In progress workout</VListItemTitle>
                            <VListItemTitle v-else>Resume workout</VListItemTitle>
                            <VListItemSubtitle>{{ workout.name }}</VListItemSubtitle>
                        </VListItemContent>
                    </VListItem>

                    <VListItem
                        :key="getCurrentSet(workout.uuid).uuid"
                        link
                        :to="{ name: 'setOverview', params: { sessionSetUuid: getCurrentSet(workout.uuid).uuid }}"
                        class="menu-sub-item"
                    >
                        <VListItemAction>
                            <VIcon color="success">{{ $svgIcons.mdiPlay }}</VIcon>
                        </VListItemAction>
                        <VListItemContent>
                            <VListItemTitle v-if="setIsInFocus(getCurrentSet(workout.uuid))">In progress set</VListItemTitle>
                            <VListItemTitle v-else>Resume set</VListItemTitle>
                            <VListItemSubtitle> {{ getCurrentSet(workout.uuid).exercise.name }} - set {{ getCurrentSet(workout.uuid).position + 1 }} </VListItemSubtitle>
                        </VListItemContent>
                    </VListItem>

                </div>
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

        <VMain>
            <VFadeTransition v-if="hasLoaded" leave-absolute>
                <RouterView/>
            </VFadeTransition>
        </VMain>
    </VApp>
</template>


<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        data() {
            return {
                drawer: null,
                preventTextSelect: false,
            }
        },
        mounted() {
            const supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

            // Prevent context menu and text select on touch devices to give a real app like feel,
            // and to prevent visual interference when dragging elements.
            if (supportsTouch) {
                this.$el.oncontextmenu = (e) => {
                    e.preventDefault();
                    return false;
                }
            }

            if (supportsTouch && this.$vuetify.breakpoint.smAndDown) {
                this.preventTextSelect = true;
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
            workoutIsInFocus(workoutSessionUuid) {
                if (this.$route.name !== 'setOverview' && this.$route.name !== 'sessionOverview') {
                    return false;
                }

                return this.$store.getters['workoutSession/workoutSession']?.uuid === workoutSessionUuid;
            },
            setIsInFocus(set) {
                return this.$route.name === 'setOverview' && this.$route.params.sessionSetUuid === set.uuid;
            },
            async logout() {
                if (!this.userIsAuthenticated) {
                    await this.$router.push({ name: 'login' });
                    return;
                }

                await this.$store.dispatch('app/logout');
                await this.$router.push({ name: 'login' });
            },
            getCurrentSet(workoutSessionUuid) {
                return this.$store.getters['workoutSession/currentSetForInProgressWorkout'](workoutSessionUuid);
            },
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

    .v-dialog {
        .v-card {
            border-width: 2px !important;
        }
    }

    // The small attribute does not work with svg path based icons,
    // as it only sets a font size small, rather than adjust the height and width.
    .v-icon--small {
        height: 1rem;
        width: 1rem;
    }

    // Another manual fixup of svg icon sizes.
    .v-btn__content {
        .v-icon {
            &.v-icon--left, &.v-icon--right {
                height: 2rem;
                width: 2rem;
            }
        }
    }

        .theme--light.v-icon {
        color: var(--v-primary-base);
    }

    .prevent-text-select {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none
    }

    .menu-sub-item {
        padding-left: 25px;
    }

    // This is a manual fix up for switching rom Vuetify loader to manual imports,
    // for some reason the import order of the scss switched resulting in this rule needing ot be added.
    .row {
        margin-top: 0;
        margin-bottom: 0;
    }
</style>
