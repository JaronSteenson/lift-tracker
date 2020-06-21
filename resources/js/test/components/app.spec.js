import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import App from '../../components/App';
import appModule from '../../store/modules/app';
import workoutSessionModule from '../../store/modules/workoutSession';
import Vuetify from 'vuetify';
import Vue from 'vue';

const localVue = createLocalVue();


const vuetify = new Vuetify;

Vue.use(Vuetify)

localVue.use(Vuex);
localVue.use(vuetify);

Vue.config.productionTip = false

let store, wrapper;

const workoutSession = {
    namespaced: true,
    state: workoutSessionModule.state,
    getters: workoutSessionModule.getters,
};

const app = {
    namespaced: true,
    state: appModule.state,
    actions: appModule.actions,
    getters: appModule.getters,
    mutations: appModule.mutations,
};

describe('App.vue', () => {

    test('should match unloaded snapshot', () => {
        store = new Vuex.Store({
            modules: {
                app,
                workoutSession,
            }
        });

        wrapper = mount(App, {
            store,
            localVue,
            vuetify,
            mocks: {
                $vuetify: { breakpoint: {} }
            }
        });

        expect(wrapper.element).toMatchSnapshot();
    })

    test('should match logged in snapshot', () => {
        const app = {
            namespaced: true,
            state: appModule.state,
            actions: appModule.actions,
            getters: {
                ...appModule.getters,
                userIsAuthenticated: () => true,
            },
            mutations: appModule.mutations,
        };

        store = new Vuex.Store({
            modules: {
                app,
                workoutSession,
            }
        });

        wrapper = mount(App, {
            store,
            localVue,
            vuetify,
            mocks: {
                $vuetify: { breakpoint: {} }
            },
            stubs: { 'router-link': RouterLinkStub }
        });

        expect(wrapper.element).toMatchSnapshot();
    })

})
