import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import svgIcons from './svgIcons';
import * as components from './components';
import colors from 'vuetify/lib/util/colors';

/**
 * Make all svg icon paths globally accessible.
 * @global
 */
Vue.prototype.$svgIcons = svgIcons;

Vue.use(Vuetify, {
    components,
});

export default new Vuetify({
    icons: {
        iconfont: 'mdiSvg',
    },
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: '#246080',
                accent: colors.white,
                anchor: '#246080',
                secondary: colors.grey.lighten2,
                info: colors.blue.lighten1,
                warning: colors.orange.darken2,
                error: colors.red.base,
                success: colors.green.base,
            },
            dark: {
                primary: '#fb8c00',
                accent: colors.white,
                secondary: '#cf9e68',
            },
        },
        dark: false,
    },
});
