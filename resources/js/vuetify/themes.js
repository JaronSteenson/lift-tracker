// Define colors similar to Vuetify's old color palette
const colors = {
    grey: {
        lighten2: '#EEEEEE',
        darken2: '#424242',
    },
    blue: {
        lighten1: '#42A5F5',
        base: '#2196F3',
    },
    orange: {
        darken2: '#E65100',
    },
    red: {
        base: '#F44336',
    },
    green: {
        base: '#4CAF50',
    },
    purple: {
        base: '#9C27B0',
    },
};

export const defaultLightDefinition = {
    primary: '#246080',
    secondary: colors.grey.lighten2,
    info: colors.blue.lighten1,
    warning: colors.orange.darken2,
    error: colors.red.base,
    success: colors.green.base,
    surface: '#FFFFFF',
    toolbar: '#FFFFFF',
    background: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#000000',
    'on-surface': '#000000',
    'on-background': '#000000',
    anchor: '#246080',
};

export const defaultDarkDefinition = {
    primary: '#fb8c00',
    secondary: colors.grey.darken2,
    info: colors.blue.lighten1,
    warning: colors.orange.darken2,
    error: colors.red.base,
    success: '#4caf50',
    surface: '#121212',
    toolbar: '#272727',
    background: '#121212',
    'on-primary': '#000000',
    'on-secondary': '#FFFFFF',
    'on-surface': '#FFFFFF',
    'on-background': '#FFFFFF',
    anchor: '#fb8c00',
};

const ogPurpleDefinition = {
    primary: colors.purple.base,
    secondary: colors.grey.lighten2,
    info: colors.blue.lighten1,
    warning: colors.orange.darken2,
    error: colors.red.base,
    success: colors.green.base,
    surface: '#FFFFFF',
    background: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#000000',
    'on-surface': '#000000',
    'on-background': '#000000',
    anchor: colors.purple.base,
};

export function getAvailableThemes() {
    // Dark default, and dark logged out landing page.
    const activeThemeKey = fetchSelectedThemeKey() || 'dark';

    return [
        {
            displayName: 'Dark',
            key: 'dark',
            isDark: true,
            definition: defaultDarkDefinition,
        },
        {
            displayName: 'Calypso',
            key: 'calypso',
            isDark: false,
            definition: defaultLightDefinition,
        },
        {
            displayName: 'OG Purple',
            key: 'og_purple',
            isDark: false,
            definition: ogPurpleDefinition,
        },
        {
            displayName: 'Pink',
            key: 'pink',
            isDark: false,
            definition: {
                ...ogPurpleDefinition,
                primary: '#e0218a',
                anchor: '#e0218a',
            },
        },
    ].map((theme) => {
        theme.active = theme.key === activeThemeKey;
        return theme;
    });
}

export function saveSelectedThemeKey(themeKey) {
    localStorage.setItem('themeKey', themeKey);

    // Force a storage event to notify other parts of the app
    window.dispatchEvent(
        new StorageEvent('storage', {
            key: 'themeKey',
            newValue: themeKey,
            storageArea: localStorage,
        }),
    );
}

export function getInitialVuetifyOptions() {
    const activeTheme = getActiveTheme();

    const options = {
        defaultTheme: activeTheme?.isDark ? 'dark' : 'light',
        themes: {
            light: {
                dark: false,
                colors: { ...defaultLightDefinition },
            },
            dark: {
                dark: true,
                colors: { ...defaultDarkDefinition },
            },
        },
    };

    if (activeTheme) {
        const themeName = activeTheme.isDark ? 'dark' : 'light';
        options.themes[themeName].colors = { ...activeTheme.definition };
    }

    return options;
}

export function getActiveTheme() {
    return getAvailableThemes().find((theme) => theme.active);
}

export function applyTheme($vuetifyTheme, selectedTheme) {
    // Ensure we have valid theme objects
    if (!$vuetifyTheme) {
        console.error('Invalid Vuetify theme object provided to applyTheme');
        return;
    }

    if (!selectedTheme || !selectedTheme.definition) {
        console.error('Invalid selectedTheme provided to applyTheme');
        return;
    }

    try {
        // In Vuetify 3, we switch the global theme
        const targetTheme = selectedTheme.isDark ? 'dark' : 'light';

        // Always update both theme objects to ensure consistency
        if ($vuetifyTheme.themes) {
            // Update the target theme
            if (
                $vuetifyTheme.themes[targetTheme] &&
                $vuetifyTheme.themes[targetTheme].colors
            ) {
                Object.assign(
                    $vuetifyTheme.themes[targetTheme].colors,
                    selectedTheme.definition,
                );
            }

            // Also update the opposite theme if switching between dark/light
            const oppositeTheme = targetTheme === 'dark' ? 'light' : 'dark';
            if (
                $vuetifyTheme.themes[oppositeTheme] &&
                $vuetifyTheme.themes[oppositeTheme].colors
            ) {
                const defaultColors =
                    oppositeTheme === 'dark'
                        ? defaultDarkDefinition
                        : defaultLightDefinition;
                Object.assign(
                    $vuetifyTheme.themes[oppositeTheme].colors,
                    defaultColors,
                );
            }
        }

        // Change the theme using the modern API
        if ($vuetifyTheme && typeof $vuetifyTheme.change === 'function') {
            try {
                $vuetifyTheme.change(targetTheme);

                // Verify the theme actually changed
                setTimeout(() => {
                    if ($vuetifyTheme.global && $vuetifyTheme.global.name) {
                        const currentTheme =
                            $vuetifyTheme.global.name.value ||
                            $vuetifyTheme.global.name;
                        if (currentTheme !== targetTheme) {
                            console.warn(
                                'Theme change may have failed. Expected:',
                                targetTheme,
                                'Got:',
                                currentTheme,
                            );
                            // Try one more time
                            $vuetifyTheme.change(targetTheme);
                        }
                    }
                }, 100);
            } catch (changeError) {
                console.error('Error during theme change:', changeError);
            }
        } else {
            console.warn('Theme change method not available', $vuetifyTheme);
        }
    } catch (error) {
        console.error('Error applying theme:', error);
        // Fallback - just try to set the global theme name
        const targetTheme = selectedTheme.isDark ? 'dark' : 'light';

        if ($vuetifyTheme && typeof $vuetifyTheme.change === 'function') {
            try {
                $vuetifyTheme.change(targetTheme);
            } catch (fallbackError) {
                console.error(
                    'Fallback theme change also failed:',
                    fallbackError,
                );
            }
        } else if ($vuetifyTheme.global && $vuetifyTheme.global.name) {
            if (
                typeof $vuetifyTheme.global.name === 'object' &&
                'value' in $vuetifyTheme.global.name
            ) {
                $vuetifyTheme.global.name.value = targetTheme;
            } else {
                $vuetifyTheme.global.name = targetTheme;
            }
        }
    }
}

function fetchSelectedThemeKey() {
    return localStorage.getItem('themeKey');
}
