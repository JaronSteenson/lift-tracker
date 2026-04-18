import { computed, reactive } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ResumeWorkoutFab from '../../components/ResumeWorkoutFab.vue';
import { prepareForLocalVueMount } from '../vueHelpers';

const hoisted = vi.hoisted(() => ({
    workoutSession: { value: null },
    currentSet: { value: null },
    isBootstrapped: { value: true },
    isAuthenticated: { value: true },
    isSetChangeTransitioning: { value: false },
    getCurrentSetForInProgressWorkout: vi.fn(),
}));

const route = reactive({
    name: 'HomePage',
    params: {},
});

vi.mock('vue-router', async () => {
    const actual = await vi.importActual('vue-router');

    return {
        ...actual,
        useRoute: () => route,
    };
});

vi.mock('../../components/domain/auth/composables/useAuth', () => ({
    useAuth: () => ({
        isBootstrapped: computed(() => hoisted.isBootstrapped.value),
        isAuthenticated: computed(() => hoisted.isAuthenticated.value),
    }),
}));

vi.mock(
    '../../components/domain/workoutSessions/composibles/workoutSessionQueries',
    () => ({
        getCurrentSetForInProgressWorkout:
            hoisted.getCurrentSetForInProgressWorkout,
        useInProgressWorkout: () => ({
            workoutSession: computed(() => hoisted.workoutSession.value),
        }),
        useSetChangeTransition: () => ({
            isSetChangeTransitioning: computed(
                () => hoisted.isSetChangeTransitioning.value,
            ),
        }),
    }),
);

const mountOptions = prepareForLocalVueMount();

function mountFab() {
    return shallowMount(ResumeWorkoutFab, {
        ...mountOptions,
        global: {
            ...mountOptions.global,
            stubs: {
                ...mountOptions.global.stubs,
                VBtn: {
                    name: 'VBtn',
                    props: ['to'],
                    template: '<button class="v-btn"><slot /></button>',
                },
            },
        },
    });
}

describe('ResumeWorkoutFab.vue', () => {
    beforeEach(() => {
        route.name = 'HomePage';
        route.params = {};
        hoisted.workoutSession.value = null;
        hoisted.currentSet.value = null;
        hoisted.isBootstrapped.value = true;
        hoisted.isAuthenticated.value = true;
        hoisted.isSetChangeTransitioning.value = false;
        hoisted.getCurrentSetForInProgressWorkout.mockReset();
        hoisted.getCurrentSetForInProgressWorkout.mockImplementation(
            () => hoisted.currentSet.value,
        );
    });

    test('hides when no in-progress workout exists', () => {
        const wrapper = mountFab();

        expect(wrapper.find('.fab-container').exists()).toBe(false);
    });

    test('shows and routes to the current in-progress set', () => {
        hoisted.workoutSession.value = {
            uuid: 'session-1',
        };
        hoisted.currentSet.value = {
            uuid: 'set-1',
        };

        const wrapper = mountFab();
        const button = wrapper.findComponent({ name: 'VBtn' });

        expect(wrapper.find('.fab-container').exists()).toBe(true);
        expect(button.props('to')).toEqual({
            name: 'SetOverviewPage',
            params: {
                workoutSessionUuid: 'session-1',
                sessionSetUuid: 'set-1',
            },
        });
        expect(hoisted.getCurrentSetForInProgressWorkout).toHaveBeenCalledWith(
            hoisted.workoutSession.value,
            'session-1',
        );
    });

    test('hides when already on the active in-progress set route', () => {
        hoisted.workoutSession.value = {
            uuid: 'session-1',
        };
        hoisted.currentSet.value = {
            uuid: 'set-1',
        };
        route.name = 'SetOverviewPage';
        route.params = {
            workoutSessionUuid: 'session-1',
            sessionSetUuid: 'set-1',
        };

        const wrapper = mountFab();

        expect(wrapper.find('.fab-container').exists()).toBe(false);
    });

    test('hides before auth bootstrap completes', () => {
        hoisted.workoutSession.value = {
            uuid: 'session-1',
        };
        hoisted.currentSet.value = {
            uuid: 'set-1',
        };
        hoisted.isBootstrapped.value = false;

        const wrapper = mountFab();

        expect(wrapper.find('.fab-container').exists()).toBe(false);
    });

    test('hides when unauthenticated', () => {
        hoisted.workoutSession.value = {
            uuid: 'session-1',
        };
        hoisted.currentSet.value = {
            uuid: 'set-1',
        };
        hoisted.isAuthenticated.value = false;

        const wrapper = mountFab();

        expect(wrapper.find('.fab-container').exists()).toBe(false);
    });

    test('hides again when the in-progress workout is cleared', async () => {
        hoisted.workoutSession.value = {
            uuid: 'session-1',
        };
        hoisted.currentSet.value = {
            uuid: 'set-1',
        };

        const wrapper = mountFab();
        expect(wrapper.find('.fab-container').exists()).toBe(true);

        wrapper.unmount();
        hoisted.workoutSession.value = null;
        hoisted.currentSet.value = null;
        const nextWrapper = mountFab();
        await nextWrapper.vm.$nextTick();

        expect(nextWrapper.find('.fab-container').exists()).toBe(false);
    });
});
