import { useMutation, useQuery, useQueryCache } from '@pinia/colada';
import { computed, toRaw } from 'vue';
import { useRoute } from 'vue-router';
import UuidHelper from '../../../../UuidHelper/index';
import WorkoutProgramService from '../../../../api/WorkoutProgramService';

const WORKOUT_PROGRAM_LIST_KEY = 'workoutProgramList';
const WORKOUT_PROGRAM_KEY = 'workoutProgram';
const WORKOUT_PROGRAM_BY_ROUTINE_KEY = 'workoutProgramByRoutine';
const UPDATE_WORKOUT_PROGRAM_KEY = 'updateWorkoutProgram';

export function useWorkoutProgramList() {
    const { data, isPending } = useQuery({
        // unique key for the query in the cache
        key: () => [WORKOUT_PROGRAM_LIST_KEY],
        query: async () => {
            const response = await WorkoutProgramService.getAll();
            return response.data;
        },
    });

    const shouldShowNoProgramsWelcomeHint = computed(() => {
        return !isPending.value && (data.value?.length ?? 0) === 0;
    });

    const routines = computed(() =>
        data.value.flatMap((program) =>
            (program.workoutProgramRoutines ?? []).map((routine) => ({
                ...routine,
                workoutProgram: {
                    uuid: program.uuid,
                    name: program.name,
                    createdAt: program.createdAt,
                    updatedAt: program.updatedAt,
                },
            })),
        ),
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
        // unique key for the query in the cache
        key: () => [WORKOUT_PROGRAM_KEY, uuid],
        query: async () => {
            if (!uuid) {
                return undefined;
            }

            const response = await WorkoutProgramService.get(uuid);

            return response.data;
        },
    });

    const getExercise = (uuid) => {
        return UuidHelper.findDeep(data.value.workoutProgramRoutines, uuid);
    };

    const getWorkout = (uuid) => {
        return UuidHelper.findIn(data.value.workoutProgramRoutines, uuid);
    };

    return {
        workoutProgram: data,
        isPending,
        getWorkout,
        getExercise,
    };
}

export function useWorkoutProgramByRoutine(routineUuid) {
    const queryCache = useQueryCache();

    const { data, isPending } = useQuery({
        // unique key for the query in the cache
        key: () => [WORKOUT_PROGRAM_BY_ROUTINE_KEY, routineUuid],
        query: async () => {
            if (!routineUuid) {
                return undefined;
            }

            const response =
                await WorkoutProgramService.getByRoutine(routineUuid);

            const key = [WORKOUT_PROGRAM_KEY, response.data.uuid];
            queryCache.setQueryData(key, response.data);

            return response.data;
        },
    });

    const getExercise = computed(() => (uuid) => {
        const source = data.value?.workoutProgramRoutines ?? [];
        return UuidHelper.findDeep(source, uuid);
    });

    const getWorkout = computed(() => (uuid) => {
        const source = data.value?.workoutProgramRoutines ?? [];
        return UuidHelper.findIn(source, uuid);
    });

    return {
        workoutProgram: data,
        isPending,
        getWorkout,
        getExercise,
    };
}

export function useUpdateWorkoutProgram() {
    const queryCache = useQueryCache();

    const { mutate } = useMutation({
        key: [UPDATE_WORKOUT_PROGRAM_KEY],
        mutation(updates) {
            const key = [WORKOUT_PROGRAM_KEY, updates.uuid];
            const current = toRaw(queryCache.getQueryData(key));
            const merged = { ...current, ...updates };

            return WorkoutProgramService.save(merged);
        },

        onMutate(updates) {
            const key = [WORKOUT_PROGRAM_KEY, updates.uuid];
            queryCache.setQueryData(key, (current) => ({
                ...current,
                ...updates,
            }));

            const current = toRaw(queryCache.getQueryData(key));
            return { ...current, ...updates };
        },

        onError(_err, variables, workout) {
            const key = [WORKOUT_PROGRAM_KEY, variables.uuid];
            queryCache.setQueryData(key, workout);
        },
    });

    return {
        updateWorkoutProgram: mutate,
        updateRoutine(workoutProgramUuid, updates) {
            const key = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = toRaw(queryCache.getQueryData(key));

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
            const key = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = toRaw(queryCache.getQueryData(key));

            const existingExercise = UuidHelper.findDeep(current, updates.uuid);
            Object.assign(existingExercise, updates);

            mutate(current);
        },
        addExerciseToWorkout(workoutProgramUuid, workoutUuid) {
            const key = [WORKOUT_PROGRAM_KEY, workoutProgramUuid];
            const current = toRaw(queryCache.getQueryData(key));

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

            // Create new objects/arrays immutably instead of mutating
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
    };
}
