import Vue from "vue";
import Vuetify from "vuetify";

import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

import colors from 'vuetify/lib/util/colors'

export default new Vuetify({
    icons: {
        iconfont: 'mdi'
    },
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: colors.deepPurple,
                accent: colors.white,
                anchor: colors.blue.base,
                secondary: undefined,
                info: undefined,
                warning: colors.deepOrange,
                error: colors.red.lighten2,
                success: '#4caf50',
            },
        },
    }
});
