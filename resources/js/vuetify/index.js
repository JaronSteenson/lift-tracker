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
        iconfont: 'mdiSvg'
    },
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: colors.purple,
                accent: colors.white,
                anchor: colors.blue.base,
                secondary: colors.purple.lighten2,
                info: colors.blue.lighten1,
                warning: colors.deepOrange.base,
                error: colors.red.base,
                success: colors.green.base,
            },
        },
    },
});

