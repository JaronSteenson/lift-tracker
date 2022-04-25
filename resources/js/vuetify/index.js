import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import svgIcons from './svgIcons';
import * as components from './components';
import { getInitialVuetifyOptions } from './themes';

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
        ...getInitialVuetifyOptions(),
    },
});
