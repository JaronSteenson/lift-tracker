import { createLocalVue, shallowMount } from '@vue/test-utils';
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

let store

describe('Getters.vue', () => {

    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                app: {
                    namespaced: true,
                    state: appModule.state,
                    actions: appModule.actions,
                    getters: appModule.getters,
                    mutations: appModule.mutations,
                },
                workoutSession: {
                    namespaced: true,
                    state: workoutSessionModule.state,
                    getters: workoutSessionModule.getters,
                }
            }
        })
    })

    test('should mount without crashing', () => {
        const wrapper = shallowMount(App, {
            store,
            localVue,
            vuetify,
            mocks: {
                $vuetify: { breakpoint: {} }
            }
        });

        expect(wrapper).toMatchSnapshot();
    })

})
