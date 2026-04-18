import { computed, ref } from 'vue';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import EditExerciseModal from '../../../../components/domain/programBuilder/EditExerciseModal.vue';
import { prepareForLocalVueMount } from '../../../vueHelpers';

const exercise = ref(null);
const workoutProgram = ref(null);
const updateExercise = vi.fn();
const projectionQueryArgs = [];

vi.mock(
    '../../../../components/domain/programBuilder/composibles/programBuilderQueries',
    () => ({
        useWorkoutProgram: () => ({
            workoutProgram,
            getExercise: (uuid) =>
                workoutProgram.value?.workoutProgramRoutines?.[0]?.routineExercises?.find(
                    (item) => item.uuid === uuid,
                ) || null,
        }),
        useWorkoutProgramByRoutine: () => ({
            workoutProgram,
            getExercise: computed(
                () => (uuid) =>
                    workoutProgram.value?.workoutProgramRoutines?.[0]?.routineExercises?.find(
                        (item) => item.uuid === uuid,
                    ) || null,
            ),
        }),
        useUpdateWorkoutProgram: () => ({
            updateExercise,
        }),
        useExerciseCycleProjection: (args) => {
            projectionQueryArgs.push(args);
            return {
                projection: ref({
                    weeks: [],
                }),
                isProjectionLoading: ref(false),
            };
        },
    }),
);

describe('EditExerciseModal', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        projectionQueryArgs.length = 0;
        exercise.value = {
            uuid: 'exercise-1',
            createdAt: '2026-04-18T08:00:00Z',
            name: 'Bench Press',
            weight: 100,
            rpe: 8,
            numberOfSets: 3,
            progressionScheme: 1,
            progressionSchemeSettings: {
                currentCycleWeek: 2,
                bodyType: 1,
            },
            restPeriod: 120,
            warmUp: 60,
        };
        workoutProgram.value = {
            uuid: 'program-1',
            workoutProgramRoutines: [
                {
                    uuid: 'routine-1',
                    routineExercises: [exercise.value],
                },
            ],
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('switches to training max label, locks set count, and fetches projection with debounce', async () => {
        const wrapper = shallowMount(EditExerciseModal, {
            ...prepareForLocalVueMount(),
            props: {
                value: true,
                routineExerciseUuid: 'exercise-1',
                routineUuid: 'routine-1',
                workoutProgramUuid: 'program-1',
            },
            global: {
                ...prepareForLocalVueMount().global,
                stubs: {
                    ...prepareForLocalVueMount().global.stubs,
                    TimerInput: {
                        props: ['label'],
                        template:
                            '<div class="timer-input" :data-label="label" />',
                    },
                    VTextField: {
                        props: ['label'],
                        template:
                            '<div class="v-text-field" :data-label="label" />',
                    },
                    VSelect: {
                        props: ['label', 'disabled'],
                        template:
                            '<div class="v-select" :data-label="label" :data-disabled="String(disabled)" />',
                    },
                },
            },
        });

        await flushPromises();
        await vi.advanceTimersByTimeAsync(300);
        await flushPromises();

        expect(wrapper.vm.schemeConfig.weightLabel).toBe('Training max');
        expect(wrapper.vm.schemeConfig.lockReps).toBe(true);
        expect(projectionQueryArgs).toHaveLength(1);
        expect(projectionQueryArgs[0].routineExerciseUuid.value).toBe(
            'exercise-1',
        );
        expect(projectionQueryArgs[0].enabled.value).toBe(true);
        expect(projectionQueryArgs[0].progressionScheme.value).toBe(1);
        expect(projectionQueryArgs[0].trainingMax.value).toBe(100);
        expect(projectionQueryArgs[0].currentCycleWeek.value).toBe(2);
        expect(projectionQueryArgs[0].bodyType.value).toBe(1);
    });
});
