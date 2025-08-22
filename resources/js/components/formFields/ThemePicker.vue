<template>
    <VItemGroup v-model="selectedTheme" mandatory>
        <div
            class="d-flex flex-wrap justify-start justify-sm-space-between gap-4"
        >
            <VItem
                v-for="theme in availableThemes"
                :key="theme.key"
                :value="theme"
                v-slot="{ active }"
            >
                <VCard
                    class="d-flex flex-column"
                    height="120px"
                    width="150px"
                    elevation="5"
                    :style="{
                        border: `solid 1px ${theme.definition.primary}`,
                        'border-width': active ? '4px' : '1px',
                        backgroundColor: theme.definition.background,
                    }"
                    @click="forceThemeSelection(theme)"
                >
                    <div
                        class="d-flex ma-0 pa-0 justify-center align-center"
                        :style="{
                            height: '33%',
                            color: theme.definition.primary,
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            letterSpacing: '0.0892857143em',
                            lineHeight: '1.375rem',
                            textAlign: 'center',
                        }"
                    >
                        {{ theme.displayName }}
                    </div>
                    <div
                        class="d-flex flex-wrap justify-space-around align-center"
                        :style="{ height: '33%' }"
                    >
                        <div
                            :style="{
                                backgroundColor: theme.definition.primary,
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            v-if="
                                theme.definition.primary !==
                                theme.definition.anchor
                            "
                            :style="{
                                backgroundColor: theme.definition.anchor,
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            :style="{
                                backgroundColor: theme.definition.secondary,
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            :style="{
                                backgroundColor: 'green',
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            :style="{
                                backgroundColor: 'red',
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                    </div>
                    <div
                        class="d-flex justify-center align-center is-active-text"
                        :style="{ height: '33%' }"
                    >
                        <VIcon :color="theme.definition.primary">
                            <template v-if="active">
                                {{ $svgIcons.mdiCheckCircle }}
                            </template>
                            <template v-else>
                                {{ $svgIcons.mdiCheckCircleOutline }}
                            </template>
                        </VIcon>
                    </div>
                </VCard>
            </VItem>
        </div>
    </VItemGroup>
</template>

<script>
import {
    getAvailableThemes,
    saveSelectedThemeKey,
    applyTheme,
    getActiveTheme,
} from '../../vuetify/themes';
import { svgIcons } from '../../vuetify';
import { useTheme } from 'vuetify';
import { useAppStore } from '../../stores/app';

export default {
    setup() {
        const theme = useTheme();
        const appStore = useAppStore();
        return { svgIcons, vuetifyTheme: theme, appStore };
    },
    data() {
        return {
            localStorageKey: localStorage.getItem('themeKey') || 'dark',
        };
    },
    computed: {
        availableThemes() {
            // Make this reactive to localStorageKey changes
            this.localStorageKey; // Access to make it reactive
            return getAvailableThemes();
        },
        selectedTheme: {
            get: getActiveTheme,
            set(selectedTheme) {
                // Validate the selected theme
                if (
                    !selectedTheme ||
                    !selectedTheme.key ||
                    !selectedTheme.definition
                ) {
                    console.error('Invalid theme object:', selectedTheme);
                    return;
                }

                try {
                    saveSelectedThemeKey(selectedTheme.key);

                    // Update local storage key to trigger reactivity
                    this.localStorageKey = selectedTheme.key;

                    // Use the composition API theme from setup
                    if (this.vuetifyTheme) {
                        console.log('Applying theme:', selectedTheme.key);
                        applyTheme(this.vuetifyTheme, selectedTheme);
                        console.log('Calling forceRerender...');
                        this.appStore.forceRerender();
                    } else {
                        console.error(
                            'Could not access Vuetify theme object from composition API',
                        );
                    }
                } catch (error) {
                    console.error('Error in theme setter:', error);
                }
            },
        },
    },
    methods: {
        getPreviewCardBackground() {
            return '#ffffff';
        },
        forceThemeSelection(theme) {
            // Force the theme setter to be called even if it's the same theme
            // This ensures the re-render always happens
            console.log('forceThemeSelection called with theme:', theme.key);
            console.log(
                'Current forceRerenderKey before:',
                this.appStore.forceRerenderKey,
            );

            // Always apply the theme and force re-render, even if it's the same theme
            try {
                saveSelectedThemeKey(theme.key);
                this.localStorageKey = theme.key;

                if (this.vuetifyTheme) {
                    console.log('Applying theme:', theme.key);
                    applyTheme(this.vuetifyTheme, theme);

                    // Use multiple nextTicks to ensure theme changes are fully applied
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            console.log(
                                'Calling forceRerender after double nextTick...',
                            );
                            this.appStore.forceRerender();

                            // Force a complete style recalculation
                            this.$nextTick(() => {
                                document.documentElement.style.display = 'none';
                                document.documentElement.offsetHeight; // Trigger reflow
                                document.documentElement.style.display = '';

                                // Debug: Check if CSS custom properties are set
                                const style = getComputedStyle(
                                    document.documentElement,
                                );
                                console.log(
                                    'CSS custom properties after theme change:',
                                );
                                console.log(
                                    '--v-theme-primary:',
                                    style.getPropertyValue('--v-theme-primary'),
                                );
                                console.log(
                                    '--v-theme-anchor:',
                                    style.getPropertyValue('--v-theme-anchor'),
                                );
                                console.log(
                                    'Applied theme anchor color:',
                                    theme.definition.anchor,
                                );

                                // Always manually update the anchor CSS custom property since Vuetify doesn't update custom colors
                                const currentAnchorColor = style
                                    .getPropertyValue('--v-theme-anchor')
                                    .trim();
                                console.log(
                                    'Current --v-theme-anchor in DOM:',
                                    currentAnchorColor,
                                );

                                // Convert hex color to RGB values for CSS custom property
                                const hex = theme.definition.anchor.replace(
                                    '#',
                                    '',
                                );
                                const r = parseInt(hex.substr(0, 2), 16);
                                const g = parseInt(hex.substr(2, 2), 16);
                                const b = parseInt(hex.substr(4, 2), 16);
                                const expectedRgb = `${r}, ${g}, ${b}`;

                                if (currentAnchorColor !== expectedRgb) {
                                    console.log(
                                        `Updating --v-theme-anchor from ${currentAnchorColor} to ${expectedRgb}`,
                                    );
                                    document.documentElement.style.setProperty(
                                        '--v-theme-anchor',
                                        expectedRgb,
                                    );
                                } else {
                                    console.log(
                                        '--v-theme-anchor already matches expected value',
                                    );
                                }

                                // Also fix primary color since Vuetify isn't updating it either
                                const currentPrimary = style
                                    .getPropertyValue('--v-theme-primary')
                                    .trim();
                                const primaryHex =
                                    theme.definition.primary.replace('#', '');
                                const pr = parseInt(
                                    primaryHex.substr(0, 2),
                                    16,
                                );
                                const pg = parseInt(
                                    primaryHex.substr(2, 2),
                                    16,
                                );
                                const pb = parseInt(
                                    primaryHex.substr(4, 2),
                                    16,
                                );
                                const expectedPrimaryRgb = `${pr}, ${pg}, ${pb}`;

                                if (currentPrimary !== expectedPrimaryRgb) {
                                    console.log(
                                        `Updating --v-theme-primary from ${currentPrimary} to ${expectedPrimaryRgb}`,
                                    );
                                    document.documentElement.style.setProperty(
                                        '--v-theme-primary',
                                        expectedPrimaryRgb,
                                    );
                                }

                                // Directly update anchor element colors since CSS custom property isn't taking effect immediately
                                const anchors = document.querySelectorAll(
                                    '.v-application a:not(.v-btn)',
                                );
                                console.log(
                                    `Found ${anchors.length} anchor elements to update`,
                                );

                                // Set color directly on each anchor element
                                anchors.forEach((anchor) => {
                                    anchor.style.color =
                                        theme.definition.anchor;
                                    console.log(
                                        `Set anchor color directly to: ${theme.definition.anchor}`,
                                    );
                                });

                                console.log(
                                    'Directly updated anchor colors after theme change',
                                );
                            });
                        });
                    });
                } else {
                    console.error(
                        'Could not access Vuetify theme object from composition API',
                    );
                }
            } catch (error) {
                console.error('Error in forceThemeSelection:', error);
            }

            console.log(
                'Current forceRerenderKey after:',
                this.appStore.forceRerenderKey,
            );
        },
    },
};
</script>

<style scoped>
.is-active-text {
    min-height: 2.5em;
    font-size: 0.7em;
}
</style>
