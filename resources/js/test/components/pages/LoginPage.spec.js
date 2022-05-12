import { mount } from '@vue/test-utils';
import Vuex from 'vuex';
import LoginPage from '../../../components/pages/LoginPage';
import appModule from '../../../store/modules/app';
import workoutSessionModule from '../../../store/modules/workoutSession';
import programBuilderModule from '../../../store/modules/programBuilder';
import { prepareForLocalVueMount } from '../../vueHelpers';

const mountOptions = prepareForLocalVueMount();

const workoutSession = {
    namespaced: true,
    state: workoutSessionModule.state,
    getters: workoutSessionModule.getters,
};

const programBuilder = {
    namespaced: true,
    state: programBuilderModule.state,
    getters: programBuilderModule.getters,
};

const app = {
    namespaced: true,
    state: appModule.state,
    actions: appModule.actions,
    getters: appModule.getters,
    mutations: appModule.mutations,
};

const stubs = ['RouterLink', 'RouterView'];

describe('Login page', () => {
    test('should not show the nav drawer and avatar menu when not logged in', () => {
        const store = new Vuex.Store({
            modules: {
                app,
                workoutSession,
                programBuilder,
            },
        });

        const wrapper = mount(LoginPage, {
            store,
            ...mountOptions,
            stubs,
        });

        expect(wrapper.findComponent({ name: 'VAvatar' }).exists()).toBeFalsy();
        expect(
            wrapper.findComponent({ name: 'VNavigationDrawer' }).exists()
        ).toBeFalsy();
    });
});
