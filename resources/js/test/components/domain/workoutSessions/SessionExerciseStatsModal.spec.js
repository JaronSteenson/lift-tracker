import SessionExerciseStatsModal from '../../../../components/domain/workoutSessions/SessionExerciseStatsModal';
import BackForwardToolbar from '../../../../components/BackForwardToolbar';
import { prepareForLocalVueMount } from '../../../vueHelpers';
import { shallowMount } from '@vue/test-utils';

const mountOptions = prepareForLocalVueMount();

const set = {
    weight: 50,
    reps: 10,
    restPeriodDuration: 90,
};

const workoutSession = {
    bodyWeight: null,
};

const singleSetExercise = {
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
    workoutSession,
};

const singleSetExerciseWithNotes = {
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
    notes: 'This exercise went very well.',
    workoutSession,
};

const otherSingleSetExerciseWithNotes = {
    name: 'BB bench',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
    notes: 'This exercise did not go very well.',
    workoutSession,
};

const doubleSetExercise = {
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set, set],
    workoutSession,
};

const multipleSetExercise = {
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set, set, set],
    workoutSession,
};

const mocks = {
    $route: { query: { 'stats-open': true } },
};

describe.skip('SessionExerciseStatsModal.vue', () => {
    test('should render correctly in single set mode', () => {
        const wrapper = shallowMount(SessionExerciseStatsModal, {
            props: {
                urlSearchParam: 'stats-open',
                sessionExercises: [singleSetExercise],
            },
            ...mountOptions,
            global: {
                ...mountOptions.global,
                mocks: { ...mountOptions.global.mocks, ...mocks },
            },
        });

        expect(wrapper.text()).toContain('No notes');
        expect(wrapper.text()).toContain('50kg x 10 reps');

        // Single sets have no rest period, as last sets don't have a rest.
        expect(wrapper.text()).not.toContain('Rest period');
        expect(wrapper.text()).not.toContain('1m 30s');

        // Should be no spark lines.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(0);
    });

    test('should render correctly in single rest/double set mode', () => {
        const wrapper = shallowMount(SessionExerciseStatsModal, {
            props: {
                urlSearchParam: 'stats-open',
                sessionExercises: [doubleSetExercise],
            },
            ...mountOptions,
            global: {
                ...mountOptions.global,
                mocks: { ...mountOptions.global.mocks, ...mocks },
            },
        });

        expect(wrapper.text()).toContain('No notes');

        // Should show the graph, not text.
        expect(wrapper.text()).not.toContain('50kg x 10 reps');

        // Single sets have no rest period, as last sets don't have a rest.
        expect(wrapper.text()).toContain('1m 30s');

        // Should be 2 spark lines, Weight, Reps.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(2);
    });

    test('should render correctly in multiple set mode', () => {
        const wrapper = shallowMount(SessionExerciseStatsModal, {
            props: {
                urlSearchParam: 'stats-open',
                sessionExercises: [multipleSetExercise],
            },
            ...mountOptions,
            global: {
                ...mountOptions.global,
                mocks: { ...mountOptions.global.mocks, ...mocks },
            },
        });

        expect(wrapper.text()).toContain('No notes');

        // Should show the graph, not text.
        expect(wrapper.text()).not.toContain('50kg x 10 reps');

        // Should be 3 spark lines, Weight, Reps, Rest periods.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(3);
    });

    test('should render correctly with notes', () => {
        const wrapper = shallowMount(SessionExerciseStatsModal, {
            props: {
                urlSearchParam: 'stats-open',
                sessionExercises: [singleSetExerciseWithNotes],
            },
            ...mountOptions,
            global: {
                ...mountOptions.global,
                mocks: { ...mountOptions.global.mocks, ...mocks },
            },
        });

        expect(wrapper.text()).toContain('Notes');
        expect(wrapper.text()).toContain('This exercise went very well.');
    });

    test('should not render navigation when there is only a single exercise', () => {
        const wrapper = shallowMount(SessionExerciseStatsModal, {
            props: {
                urlSearchParam: 'stats-open',
                sessionExercises: [singleSetExercise],
            },
            ...mountOptions,
            global: {
                ...mountOptions.global,
                mocks: { ...mountOptions.global.mocks, ...mocks },
            },
        });

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        expect(backForwardToolbar.exists()).toBeFalsy();
    });

    test('should have exercise navigation when there is multiple exercises', async () => {
        const wrapper = shallowMount(SessionExerciseStatsModal, {
            props: {
                urlSearchParam: 'stats-open',
                sessionExercises: [
                    singleSetExerciseWithNotes, // DB rows.
                    otherSingleSetExerciseWithNotes, // BB bench.
                ],
            },
            ...mountOptions,
            global: {
                ...mountOptions.global,
                mocks: { ...mountOptions.global.mocks, ...mocks },
            },
        });

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        expect(backForwardToolbar.exists()).toBeTruthy();

        expect(wrapper.text()).toContain('BB bench');
        expect(wrapper.text()).toContain('This exercise did not go very well.');
        expect(backForwardToolbar.vm.enableForward).toEqual(false);
        expect(backForwardToolbar.vm.enableBack).toEqual(true);

        await backForwardToolbar.vm.$emit('back');
        expect(wrapper.text()).toContain('DB rows');
        expect(wrapper.text()).toContain('This exercise went very well.');
        expect(backForwardToolbar.vm.enableForward).toEqual(true);
        expect(backForwardToolbar.vm.enableBack).toEqual(false);

        await backForwardToolbar.vm.$emit('forward');
        expect(wrapper.text()).toContain('BB bench');
        expect(wrapper.text()).toContain('This exercise did not go very well.');
        expect(backForwardToolbar.vm.enableForward).toEqual(false);
        expect(backForwardToolbar.vm.enableBack).toEqual(true);
    });
});
