import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
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

    const routines = computed(() =>
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

export function useWorkoutProgram() {
    const route = useRoute();
    const uuid = route.params.workoutProgramUuid;

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
        queryKey: [WORKOUT_PROGRAM_BY_ROUTINE_KEY, routineUuid],
        queryFn: async () => {
            if (!routineUuid) {
                return undefined;
            }

            const response =
                await WorkoutProgramService.getByRoutine(routineUuid);

            // Also update the main workout program cache
            queryClient.setQueryData(
                [WORKOUT_PROGRAM_KEY, response.data.uuid],
                response.data,
            );

            return response.data;
        },
        enabled: !!routineUuid,
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

export function useUpdateWorkoutProgram() {
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (updatedWorkoutProgram) => {
            return WorkoutProgramService.save(updatedWorkoutProgram);
        },

        onMutate: async (updatedWorkoutProgram) => {
            const queryKey = [WORKOUT_PROGRAM_KEY, updatedWorkoutProgram.uuid];

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousWorkoutProgram =
                queryClient.getQueryData(queryKey);

            // Optimistically update to the new value
            queryClient.setQueryData(queryKey, updatedWorkoutProgram);

            // Return context with the snapshot
            return { previousWorkoutProgram, queryKey };
        },

        onError: (err, updatedWorkoutProgram, context) => {
            // Rollback to the previous value on error
            if (context?.previousWorkoutProgram) {
                queryClient.setQueryData(
                    context.queryKey,
                    context.previousWorkoutProgram,
                );
            }
        },

        onSuccess: (response, updatedWorkoutProgram, context) => {
            // Update with server response
            queryClient.setQueryData(context.queryKey, response.data);
        },
    });

    return {
        updateWorkoutProgram: mutate,

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
    };
}
