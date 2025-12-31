import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { useRoute } from 'vue-router';
import UuidHelper from '../../../../UuidHelper/index';
import WorkoutProgramService from '../../../../api/WorkoutProgramService';

const WORKOUT_PROGRAM_LIST_KEY = 'workoutProgramList';
const WORKOUT_PROGRAM_KEY = 'workoutProgram';
const WORKOUT_PROGRAM_BY_ROUTINE_KEY = 'workoutProgramByRoutine';

export function useWorkoutProgramList() {
    const { data, isPending } = useQuery({
        queryKey: [WORKOUT_PROGRAM_LIST_KEY],
        queryFn: async () => {
            const response = await WorkoutProgramService.getAll();
            return response.data;
        },
    });

    const shouldShowNoProgramsWelcomeHint = computed(() => {
        return !isPending.value && (data.value?.length ?? 0) === 0;
    });

    const routines = computed(
        () =>
            data.value?.flatMap((program) =>
                (program.workoutProgramRoutines ?? []).map((routine) => ({
                    ...routine,
                    workoutProgram: {
                        uuid: program.uuid,
                        name: program.name,
                        createdAt: program.createdAt,
                        updatedAt: program.updatedAt,
                    },
                })),
            ) || [],
    );

    return {
        workoutPrograms: data,
        routines,
        isPending,
        shouldShowNoProgramsWelcomeHint,
    };
}

export function useWorkoutProgram(workoutProgramUuid = null) {
    const route = useRoute();
    const uuid = workoutProgramUuid || route.params.workoutProgramUuid;

    const { data, isPending } = useQuery({
        queryKey: [WORKOUT_PROGRAM_KEY, uuid],
        queryFn: async () => {
            if (!uuid) {
                return undefined;
            }

            const response = await WorkoutProgramService.get(uuid);
            return response.data;
        },
        enabled: !!uuid,
    });

    const getExercise = (uuid) => {
        return UuidHelper.findDeep(data.value?.workoutProgramRoutines, uuid);
    };

    const getRoutine = (uuid) => {
        return UuidHelper.findIn(data.value?.workoutProgramRoutines, uuid);
    };

    return {
        workoutProgram: data,
        isPending,
        getRoutine,
        getExercise,
    };
}

export function useWorkoutProgramByRoutine(routineUuid) {
    const queryClient = useQueryClient();

    const { data, isPending } = useQuery({
        queryKey: computed(() => [
            WORKOUT_PROGRAM_BY_ROUTINE_KEY,
            toValue(routineUuid),
        ]),
        queryFn: async () => {
            const uuid = toValue(routineUuid);
            if (!uuid) {
                return undefined;
            }

            const response = await WorkoutProgramService.getByRoutine(uuid);

            // Also update the main workout program cache
            queryClient.setQueryData(
                [WORKOUT_PROGRAM_KEY, response.data.uuid],
                response.data,
            );

            return response.data;
        },
        enabled: computed(() => !!toValue(routineUuid)),
    });

    const getExercise = computed(() => (uuid) => {
        const source = data.value?.workoutProgramRoutines ?? [];
        return UuidHelper.findDeep(source, uuid);
    });

    const getRoutine = computed(() => (uuid) => {
        const source = data.value?.workoutProgramRoutines ?? [];
        return UuidHelper.findIn(source, uuid);
    });

    return {
        workoutProgram: data,
        isPending,
        getRoutine,
        getExercise,
    };
}

export function useUpdateWorkoutProgram(routineUuid = null) {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (updatedWorkoutProgram) => {
            return WorkoutProgramService.save(updatedWorkoutProgram);
        },

        onMutate: async (updatedWorkoutProgram) => {
            const queryKey = [WORKOUT_PROGRAM_KEY, updatedWorkoutProgram.uuid];
            const routineQueryKey = routineUuid
                ? [WORKOUT_PROGRAM_BY_ROUTINE_KEY, toValue(routineUuid)]
                : null;

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });
            if (routineQueryKey) {
                await queryClient.cancelQueries({ queryKey: routineQueryKey });
            }

            // Snapshot the previous value
            const previousWorkoutProgram = queryClient.getQueryData(queryKey);

            // Optimistically update to the new value
            queryClient.setQueryData(queryKey, updatedWorkoutProgram);

            // Also update the routine cache if in session overview mode
            if (routineQueryKey) {
                queryClient.setQueryData(
                    routineQueryKey,
                    updatedWorkoutProgram,
                );
            }

            // Return context with the snapshot
            return { previousWorkoutProgram, queryKey, routineQueryKey };
        },

        onError: (err, updatedWorkoutProgram, context) => {
            // Rollback to the previous value on error
            if (context?.previousWorkoutProgram) {
                queryClient.setQueryData(
                    context.queryKey,
                    context.previousWorkoutProgram,
                );
                if (context.routineQueryKey) {
                    queryClient.setQueryData(
                        context.routineQueryKey,
                        context.previousWorkoutProgram,
                    );
                }
            }
        },

        onSuccess: (response, updatedWorkoutProgram, context) => {
            // Update with server response
            queryClient.setQueryData(context.queryKey, response.data);
            if (context.routineQueryKey) {
                queryClient.setQueryData(
                    context.routineQueryKey,
                    response.data,
                );
            }
        },
    });

    return {
        updateWorkoutProgram(workoutProgramUuid, updates) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            const updatedWorkoutProgram = {
                ...current,
                ...updates,
            };

            mutate(updatedWorkoutProgram);
        },

        updateRoutine(workoutProgramUuid, updates) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            const updatedRoutines = UuidHelper.replaceMergeInCopy(
                current.workoutProgramRoutines,
                updates,
            );

            const updatedWorkoutProgram = {
                ...current,
                workoutProgramRoutines: updatedRoutines,
            };

            mutate(updatedWorkoutProgram);
        },

        updateExercise(workoutProgramUuid, updates) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            // Create a deep copy to avoid mutations
            const updatedWorkoutProgram = JSON.parse(JSON.stringify(current));
            const existingExercise = UuidHelper.findDeep(
                updatedWorkoutProgram,
                updates.uuid,
            );
            Object.assign(existingExercise, updates);

            mutate(updatedWorkoutProgram);
        },

        addExerciseToWorkout(workoutProgramUuid, workoutUuid) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            const workoutProgramRoutine = UuidHelper.findIn(
                current.workoutProgramRoutines,
                workoutUuid,
            );

            const exerciseNumber =
                workoutProgramRoutine.routineExercises.length + 1;
            const newExercise = {
                uuid: UuidHelper.assign(),
                name: `Exercise ${exerciseNumber}`,
                position: workoutProgramRoutine.routineExercises.length,
                numberOfSets: 3,
                restPeriod: 60,
                warmUp: 60,
                weight: null,
            };

            // Create new objects/arrays immutably
            const updatedRoutine = {
                ...workoutProgramRoutine,
                routineExercises: [
                    ...workoutProgramRoutine.routineExercises,
                    newExercise,
                ],
            };

            const updatedRoutines = UuidHelper.replaceMergeInCopy(
                current.workoutProgramRoutines,
                updatedRoutine,
            );

            const updatedWorkoutProgram = {
                ...current,
                workoutProgramRoutines: updatedRoutines,
            };

            mutate(updatedWorkoutProgram);
        },

        removeExerciseFromWorkout(workoutProgramUuid, exerciseUuid) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            const updatedRoutines = current.workoutProgramRoutines.map(
                (routine) => {
                    return {
                        ...routine,
                        routineExercises: routine.routineExercises.filter(
                            (exercise) => exercise.uuid !== exerciseUuid,
                        ),
                    };
                },
            );

            const updatedWorkoutProgram = {
                ...current,
                workoutProgramRoutines: updatedRoutines,
            };

            mutate(updatedWorkoutProgram);
        },

        addWorkoutToProgram(workoutProgramUuid) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            const newWorkout = {
                uuid: UuidHelper.assign(),
                name: `Workout ${current.workoutProgramRoutines.length + 1}`,
                normalDay: 'any',
                position: current.workoutProgramRoutines.length,
                routineExercises: [],
            };

            const updatedWorkoutProgram = {
                ...current,
                workoutProgramRoutines: [
                    ...current.workoutProgramRoutines,
                    newWorkout,
                ],
            };

            mutate(updatedWorkoutProgram);
        },

        deleteWorkout(workoutProgramUuid, workoutUuid) {
            const queryKey = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = queryClient.getQueryData(queryKey);

            // Remove the workout and update positions
            const updatedRoutines = current.workoutProgramRoutines
                .filter((routine) => routine.uuid !== workoutUuid)
                .map((routine, index) => ({
                    ...routine,
                    position: index,
                }));

            const updatedWorkoutProgram = {
                ...current,
                workoutProgramRoutines: updatedRoutines,
            };

            mutate(updatedWorkoutProgram);
        },
    };
}
