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
                        applyTheme(this.vuetifyTheme, selectedTheme);
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

            // Always apply the theme and force re-render, even if it's the same theme
            try {
                saveSelectedThemeKey(theme.key);
                this.localStorageKey = theme.key;

                if (this.vuetifyTheme) {
                    applyTheme(this.vuetifyTheme, theme);

                    // Use multiple nextTicks to ensure theme changes are fully applied
                    this.$nextTick(() => {
                        this.$nextTick(() => {
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

                                // Always manually update the anchor CSS custom property since Vuetify doesn't update custom colors
                                const currentAnchorColor = style
                                    .getPropertyValue('--v-theme-anchor')
                                    .trim();

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
                                    document.documentElement.style.setProperty(
                                        '--v-theme-anchor',
                                        expectedRgb,
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
                                    document.documentElement.style.setProperty(
                                        '--v-theme-primary',
                                        expectedPrimaryRgb,
                                    );
                                }

                                // Directly update anchor element colors since CSS custom property isn't taking effect immediately
                                const anchors = document.querySelectorAll(
                                    '.v-application a:not(.v-btn)',
                                );

                                // Set color directly on each anchor element
                                anchors.forEach((anchor) => {
                                    anchor.style.color =
                                        theme.definition.anchor;
                                });
                            });
                        });
                    });
                }
            } catch (error) {
                console.error('Error in forceThemeSelection:', error);
            }
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
