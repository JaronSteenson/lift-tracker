import { createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";

export function createLocalVueMountOptions() {
    const localVue = createLocalVue();
    const vuetify = new Vuetify;

    Vue.use(Vuetify)

    localVue.use(Vuex);
    localVue.use(vuetify);

    Vue.config.productionTip = false

    return {
        localVue,
        vuetify,
        mocks: {
            $vuetify: { breakpoint: {} }
        }
    };
}



