import {createLocalVue, mount, RouterLinkStub, shallowMount} from '@vue/test-utils';
import Vuex from 'vuex';
import SessionExerciseStatsModal from '../../../../components/domain/workoutSessions/SessionExerciseStatsModal';
import Vuetify from 'vuetify';
import Vue from 'vue';

const localVue = createLocalVue();


const vuetify = new Vuetify;

Vue.use(Vuetify)

localVue.use(Vuex);
localVue.use(vuetify);

Vue.config.productionTip = false

let wrapper;

let set = {
    weight: 50,
    reps: 10,
    restPeriodDuration: 90,
};

let singleSetExercise = {
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
}

let multipleSetExercise = {
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set, set, set],
}

describe('SessionExerciseStatsModal.vue', () => {

    test('should render correctly in single set mode', () => {
        wrapper = mount(SessionExerciseStatsModal, {
            propsData: {
                value: true,
                sessionExercise: singleSetExercise
            },
            localVue,
            vuetify,
            mocks: {
                $vuetify: { breakpoint: {} }
            }
        });

        expect(wrapper.text()).toContain('No notes')
        expect(wrapper.text()).toContain('50kg x 10 reps')
        expect(wrapper.text()).toContain('1m 30s')
        expect(wrapper.element).toMatchSnapshot();
    });

    test('should render correctly in multiple set mode', () => {
        wrapper = shallowMount(SessionExerciseStatsModal, {
            propsData: {
                value: true,
                sessionExercise: multipleSetExercise
            },
            localVue,
            vuetify,
            mocks: {
                $vuetify: { breakpoint: {} }
            }
        });

        expect(wrapper.text()).toContain('No notes')
        expect(wrapper.element).toMatchSnapshot();
    });

    test('should render correctly with notes', () => {
        singleSetExercise.notes = 'This exercise went very well.';

        wrapper = shallowMount(SessionExerciseStatsModal, {
            propsData: {
                value: true,
                sessionExercise: singleSetExercise
            },
            localVue,
            vuetify,
            mocks: {
                $vuetify: { breakpoint: {} }
            }
        });

        expect(wrapper.text()).toContain('Notes')
        expect(wrapper.text()).toContain('This exercise went very well.')
    });

})
