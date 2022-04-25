import { colors } from 'vuetify/lib';

export const defaultLightDefinition = {
    primary: '#246080',
    secondary: colors.grey.lighten2,
    accent: null,
    anchor: '#246080',
    info: colors.blue.lighten1,
    warning: colors.orange.darken2,
    error: colors.red.base,
    success: colors.green.base,
};

export const defaultDarkDefinition = {
    primary: '#fb8c00',
    secondary: colors.grey.darken2,
    accent: null,
    anchor: '#fb8c00',
    info: colors.blue.lighten1,
    warning: colors.orange.darken2,
    error: colors.red.base,
    success: colors.green.base,
};

const ogPurpleDefinition = {
    primary: colors.purple.base,
    secondary: colors.grey.lighten2,
    accent: null,
    anchor: colors.blue.base,
    info: colors.blue.lighten1,
    warning: colors.orange.darken2,
    error: colors.red.base,
    success: colors.green.base,
};

export function getAvailableThemes() {
    const activeThemeKey = fetchSelectedThemeKey() || 'calypso';

    return [
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
        {
            displayName: 'Dark',
            key: 'dark',
            isDark: true,
            definition: defaultDarkDefinition,
        },
    ].map((theme) => {
        theme.active = theme.key === activeThemeKey;
        return theme;
    });
}

export function saveSelectedThemeKey(themeKey) {
    localStorage.setItem('themeKey', themeKey);
}

export function getInitialVuetifyOptions() {
    const activeTheme = getActiveTheme();

    const options = {
        themes: {},
    };

    applyTheme(options, activeTheme);
    return options;
}

export function getActiveTheme() {
    return getAvailableThemes().find((theme) => theme.active);
}

export function applyTheme($vuetifyTheme, selectedTheme) {
    $vuetifyTheme.themes.light = { ...defaultLightDefinition };
    $vuetifyTheme.themes.dark = { ...defaultDarkDefinition };

    const vuetifyVariant = selectedTheme.isDark ? 'dark' : 'light';
    const newVuetifyTheme = $vuetifyTheme.themes[vuetifyVariant];

    Object.keys(selectedTheme.definition).forEach((key) => {
        newVuetifyTheme[key] = selectedTheme.definition[key];
    });

    $vuetifyTheme.dark = selectedTheme.isDark;
}

function fetchSelectedThemeKey() {
    return localStorage.getItem('themeKey');
}
