import { createLocalVue } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
import svgIcons from '../vuetify/svgIcons';

export function prepareForLocalVueMount() {
    ensureVuetifyAppDivExists();
    return localMountOptions();
}

function ensureVuetifyAppDivExists() {
    if (document.querySelector('[data-app]') !== null) {
        return;
    }

    const app = document.createElement('div');
    app.setAttribute('data-app', '');
    document.body.append(app);
}

function localMountOptions() {
    const localVue = createLocalVue();
    const vuetify = new Vuetify();

    Vue.use(Vuetify);
    Vue.use(Vuex);

    Vue.config.productionTip = false;

    return {
        localVue,
        vuetify,
        mocks: {
            // $vuetify: { breakpoint: {} },
            $svgIcons: svgIcons,
        },
    };
}
