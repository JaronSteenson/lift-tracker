<template>
    <VApp :class="{ 'prevent-text-select': preventTextSelect }">
        <AppNavigationDrawer />
        <VMain>
            <KeepAlive v-if="isBootstrapped" include="HomePage">
                <RouterView />
            </KeepAlive>
        </VMain>
    </VApp>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import AppNavigationDrawer from "./AppNavigationDrawer";

export default {
    components: {
        AppNavigationDrawer,
    },
    data() {
        return {
            drawer: null,
            preventTextSelect: false,
        };
    },
    mounted() {
        this.setSupportsTextSelect();
    },
    computed: {
        ...mapState("app", ["appName", "isBootstrapped"]),
        ...mapGetters("app", {
            avatarInitial: "getUserAvatarInitial",
            userIsAuthenticated: "userIsAuthenticated",
            showSessionExpiredModal: "showSessionExpiredModal",
        }),
        ...mapGetters("programBuilder", ["myWorkoutPrograms"]),
    },
    methods: {
        setSupportsTextSelect() {
            if (window.location.host === "localhost") {
                return;
            }

            const supportsTouch =
                "ontouchstart" in window || navigator.msMaxTouchPoints;

            // Prevent context menu and text select on touch devices to give a real app like feel,
            // and to prevent visual interference when dragging elements.
            if (supportsTouch) {
                this.$el.oncontextmenu = (e) => {
                    e.preventDefault();
                    return false;
                };
            }

            if (supportsTouch && this.$vuetify.breakpoint.smAndDown) {
                this.preventTextSelect = true;
            }
        },
    },
};
</script>

<style lang="scss">
.w-100 {
    width: 100%;
}

.v-hidden {
    visibility: hidden;
}

.app-name {
    text-decoration: none;
    color: var(--v-accent-base) !important;
}

.small-login-page-link {
    color: #f5f5f5 !important;
    font-size: 0.8em;
}

.full-page-form {
    width: 100%;
    min-width: 300px;
}

.container-large {
    margin-top: 15vh;
    @media (min-width: 600px) {
        margin-top: 15vh;
    }
}

.login-error {
    color: var(--v-error-base);
}

.v-main--not-logged-in {
    background-color: #00324f; // Hard-codded default light theme primary darken 2
}

.v-dialog {
    .v-card {
        border-width: 2px !important;
    }

    @media (max-width: 600px) {
        &:not(.v-dialog--fullscreen) {
            // Half the default margin of dialogs on small devices (important for login dialog).
            margin: 12px;
        }
    }
}

// This weirdly defaults to break all.
.v-card__title {
    word-break: break-word;
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
        &.v-icon--left,
        &.v-icon--right {
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
    user-select: none;
}

// This is a manual fix up for switching rom Vuetify loader to manual imports,
// for some reason the import order of the scss switched resulting in this rule needing ot be added.
.row {
    margin-top: 0;
    margin-bottom: 0;
}

.disable-btn-active.v-btn--active::before {
    background-color: transparent;
}

// Flexbox gap helpers, mapping to vuetify padding/margin helpers.
$vuetify-gap-basis: 4px;
.gap-1 {
    gap: 1 * $vuetify-gap-basis;
}
.gap-4 {
    gap: 4 * $vuetify-gap-basis;
}

::-webkit-scrollbar {
    width: 5px;
    height: 10px;
}

/* Track */
::-webkit-scrollbar-track {
    opacity: 0;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #b9b9b9;
    border-radius: 15px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #787777;
}
</style>
