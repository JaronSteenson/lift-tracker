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

const createMountOptions = (props) => ({
    props: {
        urlSearchParam: 'stats-open',
        ...props,
    },
    ...mountOptions,
    global: {
        ...mountOptions.global,
        mocks: {
            ...mountOptions.global.mocks,
            $route: { query: { 'stats-open': 'true' }, path: '/test' },
            $router: { push: jest.fn() },
        },
    },
});

describe('SessionExerciseStatsModal.vue', () => {
    test('should render correctly in single set mode', () => {
        const wrapper = shallowMount(
            SessionExerciseStatsModal,
            createMountOptions({
                sessionExercises: [singleSetExercise],
            }),
        );

        expect(wrapper.text()).toContain('Notes');
        expect(wrapper.text()).toContain('50');

        // Should be no spark lines for single set
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(0);
    });

    test('should render correctly in single rest/double set mode', () => {
        const wrapper = shallowMount(
            SessionExerciseStatsModal,
            createMountOptions({
                sessionExercises: [doubleSetExercise],
            }),
        );

        expect(wrapper.text()).toContain('Notes');

        // Should show the graph, sparklines are rendered
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toBeGreaterThan(0);

        // Should have rest period displayed
        expect(wrapper.text()).toContain('1m 30s');

        // Should be 2 spark lines, Weight, Reps.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(2);
    });

    test('should render correctly in multiple set mode', () => {
        const wrapper = shallowMount(
            SessionExerciseStatsModal,
            createMountOptions({
                sessionExercises: [multipleSetExercise],
            }),
        );

        expect(wrapper.text()).toContain('Notes');

        // Should show sparklines for multiple sets
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toBeGreaterThan(0);

        // Should be 3 spark lines, Weight, Reps, Rest periods.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(3);
    });

    test('should render correctly with notes', () => {
        const wrapper = shallowMount(
            SessionExerciseStatsModal,
            createMountOptions({
                sessionExercises: [singleSetExerciseWithNotes],
            }),
        );

        expect(wrapper.text()).toContain('Notes');
        expect(wrapper.text()).toContain('This exercise went very well.');
    });

    test('should not render navigation when there is only a single exercise', () => {
        const wrapper = shallowMount(
            SessionExerciseStatsModal,
            createMountOptions({
                sessionExercises: [singleSetExercise],
            }),
        );

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        expect(backForwardToolbar.exists()).toBeFalsy();
    });

    test('should have exercise navigation when there is multiple exercises', async () => {
        const wrapper = shallowMount(
            SessionExerciseStatsModal,
            createMountOptions({
                sessionExercises: [
                    singleSetExerciseWithNotes, // DB rows.
                    otherSingleSetExerciseWithNotes, // BB bench.
                ],
            }),
        );

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        expect(backForwardToolbar.exists()).toBeTruthy();

        // Component starts on the last exercise (BB bench)
        expect(wrapper.text()).toContain('This exercise did not go very well.');
        expect(backForwardToolbar.props('enableForward')).toBe(false);
        expect(backForwardToolbar.props('enableBack')).toBe(true);

        await backForwardToolbar.vm.$emit('back');
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('This exercise went very well.');
        expect(backForwardToolbar.props('enableForward')).toBe(true);
        expect(backForwardToolbar.props('enableBack')).toBe(false);

        await backForwardToolbar.vm.$emit('forward');
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('This exercise did not go very well.');
        expect(backForwardToolbar.props('enableForward')).toBe(false);
        expect(backForwardToolbar.props('enableBack')).toBe(true);
    });
});
