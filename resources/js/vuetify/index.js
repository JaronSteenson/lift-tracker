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
                primary: colors.deepPurple.lighten1,
                accent: colors.deepPurple.darken4,
                anchor: colors.grey.darken4,
                secondary: undefined,
                info: undefined,
                warning: undefined,
                error: colors.red.lighten2,
                success: undefined,
            },
        },
    }
});
