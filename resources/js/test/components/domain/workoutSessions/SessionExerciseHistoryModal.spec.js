import SessionExerciseHistoryModal from '../../../../components/domain/workoutSessions/SessionExerciseHistoryModal';
import BackForwardToolbar from '../../../../components/BackForwardToolbar';
import { prepareForLocalVueMount } from '../../../vueHelpers';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import { useRoute, useRouter } from 'vue-router';

vi.mock('vue-router', async () => {
    const actual = await vi.importActual('vue-router');
    return {
        ...actual,
        useRoute: vi.fn(),
        useRouter: vi.fn(),
    };
});

const mountOptions = prepareForLocalVueMount();

const set = {
    weight: 50,
    reps: 10,
    rpe: 8,
    restPeriodDuration: 90,
};

const singleSetExercise = {
    uuid: 'exercise-1',
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
    bodyWeight: null,
};

const singleSetExerciseWithNotes = {
    uuid: 'exercise-2',
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
    notes: 'This exercise went very well.',
    bodyWeight: null,
};

const otherSingleSetExerciseWithNotes = {
    uuid: 'exercise-3',
    name: 'BB bench',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set],
    notes: 'This exercise did not go very well.',
    bodyWeight: null,
};

const doubleSetExercise = {
    uuid: 'exercise-4',
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set, set],
    bodyWeight: null,
};

const multipleSetExercise = {
    uuid: 'exercise-5',
    name: 'DB rows',
    createdAt: '2019-12-04T12:00:00',
    sessionSets: [set, set, set],
    bodyWeight: null,
};

const createMountOptions = (props) => ({
    props: {
        urlSearchParam: 'stats-open',
        ...props,
    },
    ...mountOptions,
    global: {
        ...mountOptions.global,
    },
});

describe('SessionExerciseStatsModal.vue', () => {
    beforeEach(() => {
        vi.mocked(useRoute).mockReturnValue({
            query: { 'stats-open': 'true' },
            path: '/test',
        });
        vi.mocked(useRouter).mockReturnValue({
            push: vi.fn(),
        });
    });

    test('should render correctly in single set mode', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
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
            SessionExerciseHistoryModal,
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

        // Should be 3 spark lines, Weight, Reps, RPE.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(3);
    });

    test('should render correctly in multiple set mode', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [multipleSetExercise],
            }),
        );

        expect(wrapper.text()).toContain('Notes');

        // Should show sparklines for multiple sets
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toBeGreaterThan(0);

        // Should be 4 spark lines, Weight, Reps, RPE, Rest periods.
        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(4);
    });

    test('should render rpe after reps and show N/A without an rpe sparkline for mixed values', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [
                    {
                        ...doubleSetExercise,
                        sessionSets: [
                            { ...set, rpe: 8 },
                            { ...set, rpe: null },
                        ],
                    },
                ],
            }),
        );

        const text = wrapper.text();
        expect(text.indexOf('Reps')).toBeLessThan(text.indexOf('RPE'));
        expect(text).toContain('N/A');

        expect(
            wrapper.findAllComponents({ name: 'VSparkline' }).length,
        ).toEqual(2);
    });

    test('should render correctly with notes', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [singleSetExerciseWithNotes],
            }),
        );

        expect(wrapper.text()).toContain('Notes');
        expect(wrapper.text()).toContain('This exercise went very well.');
    });

    test('should render a copy notes button for a historical exercise with notes', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                currentSessionExerciseUuid: 'current-exercise-uuid',
                sessionExercises: [singleSetExerciseWithNotes],
            }),
        );

        expect(
            wrapper
                .find('[aria-label="Copy notes to current session"]')
                .exists(),
        ).toBe(true);
    });

    test('should not render a copy notes button when viewing the current session exercise', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                currentSessionExerciseUuid: singleSetExerciseWithNotes.uuid,
                sessionExercises: [singleSetExerciseWithNotes],
            }),
        );

        expect(
            wrapper
                .find('[aria-label="Copy notes to current session"]')
                .exists(),
        ).toBe(false);
    });

    test('should emit copy-notes with the viewed note text', async () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                currentSessionExerciseUuid: 'current-exercise-uuid',
                sessionExercises: [singleSetExerciseWithNotes],
            }),
        );

        await wrapper
            .find('[aria-label="Copy notes to current session"]')
            .trigger('click');

        expect(wrapper.emitted('copy-notes')).toEqual([
            ['This exercise went very well.'],
        ]);
    });

    test('should not render navigation when there is only a single exercise', () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [singleSetExercise],
            }),
        );

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        expect(backForwardToolbar.exists()).toBeFalsy();
    });

    test('should have exercise navigation when there is multiple exercises', async () => {
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
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

    test('should prewarm the next page when opened with older history available', async () => {
        const fetchNextPage = vi.fn().mockResolvedValue();

        shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [
                    singleSetExerciseWithNotes,
                    otherSingleSetExerciseWithNotes,
                ],
                hasNextPage: true,
                fetchNextPage,
            }),
        );

        await flushPromises();

        expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    test('should fetch older history when navigating back from the oldest loaded item', async () => {
        const fetchNextPage = vi.fn().mockResolvedValue();
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [
                    singleSetExerciseWithNotes,
                    otherSingleSetExerciseWithNotes,
                ],
                hasNextPage: true,
                fetchNextPage,
            }),
        );

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        await backForwardToolbar.vm.$emit('back');
        await wrapper.vm.$nextTick();
        await backForwardToolbar.vm.$emit('back');
        await flushPromises();

        expect(fetchNextPage).toHaveBeenCalledTimes(2);
    });

    test('should preserve the current exercise when older history prepends', async () => {
        const fetchNextPage = vi.fn().mockResolvedValue();
        const wrapper = shallowMount(
            SessionExerciseHistoryModal,
            createMountOptions({
                sessionExercises: [
                    singleSetExerciseWithNotes,
                    otherSingleSetExerciseWithNotes,
                ],
                hasNextPage: true,
                fetchNextPage,
            }),
        );

        const backForwardToolbar = wrapper.findComponent(BackForwardToolbar);
        await backForwardToolbar.vm.$emit('back');
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('This exercise went very well.');

        await wrapper.setProps({
            sessionExercises: [
                {
                    ...singleSetExercise,
                    uuid: 'exercise-older',
                    notes: 'Older item',
                },
                singleSetExerciseWithNotes,
                otherSingleSetExerciseWithNotes,
            ],
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('This exercise went very well.');
        expect(wrapper.text()).not.toContain('Older item');
    });
});
