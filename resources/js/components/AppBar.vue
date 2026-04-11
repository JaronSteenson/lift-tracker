<template>
    <VAppBar :style="{ backgroundColor: colour }" app density="compact">
        <div
            class="d-flex justify-space-between align-center toolbar-content-container"
        >
            <div
                class="text-left"
                :class="{
                    'fixed-outside-flex-basis': display.smAndUp.value,
                    'left-align-title': display.xs.value,
                }"
            >
                <VAppBarNavIcon
                    v-if="showDrawerIcon && userIsAuthenticated"
                    @click.stop="toggleDrawer"
                />
                <VBtn
                    v-else-if="backTo"
                    :to="backTo"
                    icon
                    active-class="disable-btn-active"
                >
                    <VIcon>
                        {{ svgIcons.backNavigation }}
                    </VIcon>
                </VBtn>

                <slot v-if="display.xs.value" name="middle">
                    <VToolbarTitle class="mx-2 d-flex align-center">
                        {{ title || appName }}
                    </VToolbarTitle>
                </slot>
            </div>

            <slot v-if="display.smAndUp.value" name="middle">
                <VToolbarTitle class="mx-2">
                    {{ title || appName }}
                </VToolbarTitle>
            </slot>

            <div
                class="d-flex justify-end"
                :class="{
                    'fixed-outside-flex-basis': display.smAndUp.value,
                }"
            >
                <AvatarInitials v-if="!$slots.right" />
                <slot name="right" />
            </div>
        </div>
    </VAppBar>
</template>

<script>
import AvatarInitials from './AvatarInitials';
import { useDisplay } from 'vuetify';
import { svgIcons } from '../vuetify';
import { useTheme } from 'vuetify/framework';
import { useAuth } from './domain/auth/composables/useAuth';
import { useAppShell } from '../composables/useAppShell';

export default {
    name: 'AppBar',
    components: {
        AvatarInitials,
    },
    props: {
        showDrawerIcon: Boolean,
        backTo: [Object, String],
        title: String,
    },
    setup() {
        const { userIsAuthenticated } = useAuth();
        const { appName, navigationDrawerOpen, setNavigationDrawerOpen } =
            useAppShell();
        const display = useDisplay();
        const theme = useTheme();

        // Option 1: Use hex color value with bg-color prop
        const colour =
            theme.current.value.colors.toolbar ||
            theme.current.value.colors.background;

        // Option 2: Use theme color name with color prop (uncomment if you prefer this)
        // const colour = 'surface'; // or 'background', 'primary', etc.
        function toggleDrawer() {
            setNavigationDrawerOpen(!navigationDrawerOpen.value);
        }

        return {
            appName,
            userIsAuthenticated,
            display,
            svgIcons,
            toggleDrawer,
            colour,
        };
    },
};
</script>

<style scoped>
.toolbar-content-container {
    width: 100%;
}

.fixed-outside-flex-basis {
    flex-basis: 30%;
}

.left-align-title {
    display: flex;
    align-items: center;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
