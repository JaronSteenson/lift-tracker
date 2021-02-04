import { mount, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';
import App from '../../components/App';
import appModule from '../../store/modules/app';
import workoutSessionModule from '../../store/modules/workoutSession';
import { prepareForLocalVueMount } from '../vueHelpers';

const mountOptions = prepareForLocalVueMount();

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

    test('should not show the nav drawer and avatar menu when not logged in', () => {
        const store = new Vuex.Store({
            modules: {
                app,
                workoutSession,
            }
        });

        const wrapper = mount(App, {
            store,
            ...mountOptions,
        });

        expect(wrapper.findComponent({ name: 'VAvatar' }).exists()).toBeFalsy();
        expect(wrapper.findComponent({ name: 'VNavigationDrawer' }).exists()).toBeFalsy();
    });

    test('should show the nav drawer and avatar menu when not logged in', () => {
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

        const store = new Vuex.Store({
            modules: {
                app,
                workoutSession,
            }
        });

        const wrapper = mount(App, {
            store,
            ...mountOptions,
            stubs: { 'router-link': RouterLinkStub },
        });

        expect(wrapper.findComponent({ name: 'VAvatar' }).exists()).toBeTruthy();
        expect(wrapper.findComponent({ name: 'VNavigationDrawer' }).exists()).toBeTruthy();
    });

});
