import {
    useQuery,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { differenceInSeconds, isToday } from 'date-fns';
import { utcNow } from '../../../../dates';
import UuidHelper from '../../../../UuidHelper/index';
import WorkoutSessionService from '../../../../api/WorkoutSessionService';
import SessionExerciseService from '../../../../api/SessionExerciseService';
import createSessionFromBuilderWorkout from '../../../../domain/createSessionFromBuilderWorkout';
import { useAppStore } from '../../../../stores/app';

const WORKOUT_SESSION_KEY = 'workoutSession';
const WORKOUT_SESSION_BY_SET_KEY = 'workoutSessionBySet';
const EXERCISE_HISTORY_KEY = 'exerciseHistory';
const LOCAL_STORAGE_KEY = 'store-state--WorkoutSession';

function getSecondsRemaining({ expectedDuration, startTime }) {
    const minutesToAdd = Math.floor(expectedDuration / 60);
    const secondsToAdd = expectedDuration - minutesToAdd * 60;

    const finishTimeMinutes = minutesToAdd + startTime.getMinutes();
    const finishTimeSeconds = secondsToAdd + startTime.getSeconds();

    let finishTime = new Date(startTime);
    finishTime.setMinutes(finishTimeMinutes);
    finishTime.setSeconds(finishTimeSeconds);

    const now = Math.round(new Date(utcNow()).getTime() / 1000);
    const finishInSeconds = Math.round(finishTime.getTime() / 1000);

    return finishInSeconds - now;
}

export function useTimelineQuery() {
    const pageSize = 10;

    const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ['timeline'],
            queryFn: async ({ pageParam = 0 }) => {
                const response = await WorkoutSessionService.index({
                    pageIndex: pageParam,
                    pageSize,
                });
                return response.data;
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < pageSize) {
                    return undefined;
                }
                return allPages.length;
            },
        });

    const flattenedData = computed(() => {
        return data.value?.pages?.flat() ?? [];
    });

    const shouldShowNoProgramsHintStartNewSession = computed(() => {
        return !isPending.value && flattenedData.value.length === 0;
    });

    return {
        data: flattenedData,
        isPending,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        shouldShowNoProgramsHintStartNewSession,
    };
}

export function getFirstSet(workoutSession) {
    const firstExercise = workoutSession?.sessionExercises?.[0];
    return firstExercise?.sessionSets?.[0] || null;
}

export function getNotSkippedSessionExercises(workoutSession) {
    return (
        workoutSession?.sessionExercises?.filter(
            (exercise) => !exercise.skipped,
        ) || []
    );
}

export function getSet(workoutSession, sessionSetUuid) {
    return UuidHelper.findDeep(workoutSession, sessionSetUuid);
}

export function getExerciseBySet(workoutSession, sessionSetUuid) {
    let foundExercise = null;
    workoutSession?.sessionExercises?.forEach((exercise) => {
        exercise.sessionSets?.forEach((set) => {
            if (set.uuid === sessionSetUuid) {
                foundExercise = exercise;
            }
        });
    });
    return foundExercise;
}

export function isInProgressWorkout(workoutSession, workoutSessionUuid) {
    if (!workoutSession || workoutSession.uuid !== workoutSessionUuid) {
        return false;
    }
    return workoutSession.startedAt && !workoutSession.endedAt;
}

export function getAllSets(workoutSession) {
    return (
        workoutSession?.sessionExercises
            ?.sort((a, b) => a.position - b.position)
            ?.flatMap((exercise) =>
                exercise.sessionSets.sort((a, b) => a.position - b.position),
            ) || []
    );
}

export function getPreviousSet(workoutSession, currentSetUuid) {
    const allSets = getAllSets(workoutSession);
    const currentIndex = allSets.findIndex(
        (set) => set.uuid === currentSetUuid,
    );
    return currentIndex > 0 ? allSets[currentIndex - 1] : null;
}

export function getNextSet(workoutSession, currentSetUuid) {
    const allSets = getAllSets(workoutSession);
    const currentIndex = allSets.findIndex(
        (set) => set.uuid === currentSetUuid,
    );
    return currentIndex >= 0 && currentIndex < allSets.length - 1
        ? allSets[currentIndex + 1]
        : null;
}

export function getCurrentSetForInProgressWorkout(
    workoutSession,
    workoutSessionUuid,
) {
    if (!workoutSession || workoutSession.uuid !== workoutSessionUuid) {
        return null;
    }

    if (workoutSession.endedAt) {
        return null;
    }

    // Find the first incomplete set (one without endedAt)
    let currentSet = null;
    workoutSession.sessionExercises?.some((exercise) => {
        return exercise.sessionSets?.some((set) => {
            if (!set.endedAt && set.startedAt) {
                currentSet = set;
                return true;
            }
            return false;
        });
    });

    // If no current set found, return the first unstarted set
    if (!currentSet) {
        workoutSession.sessionExercises?.some((exercise) => {
            return exercise.sessionSets?.some((set) => {
                if (!set.startedAt) {
                    currentSet = set;
                    return true;
                }
                return false;
            });
        });
    }
    return currentSet;
}

export function setIsInFocusedSession(workoutSession, sessionSetUuid) {
    return UuidHelper.findDeep(workoutSession, sessionSetUuid);
}

export function isFirstSetOfWorkout(workoutSession, sessionSetUuid) {
    const allSets = getAllSets(workoutSession);
    return allSets[0]?.uuid === sessionSetUuid;
}

export function isLastSetOfWorkout(workoutSession, sessionSetUuid) {
    if (!workoutSession) {
        return false;
    }
    const allSets = getAllSets(workoutSession);
    return allSets[allSets.length - 1]?.uuid === sessionSetUuid;
}

export function isFirstSetOfExercise(workoutSession, sessionSetUuid) {
    if (!workoutSession) {
        return false;
    }

    let exercise = null;
    workoutSession.sessionExercises?.some((ex) => {
        if (ex.sessionSets?.some((set) => set.uuid === sessionSetUuid)) {
            exercise = ex;
            return true;
        }
        return false;
    });

    if (!exercise) return false;
    const sortedSets = exercise.sessionSets.sort(
        (a, b) => a.position - b.position,
    );
    return sortedSets[0]?.uuid === sessionSetUuid;
}

export function isLastSetOfExercise(workoutSession, sessionSetUuid) {
    if (!workoutSession) return false;

    let exercise = null;
    workoutSession.sessionExercises?.some((ex) => {
        if (ex.sessionSets?.some((set) => set.uuid === sessionSetUuid)) {
            exercise = ex;
            return true;
        }
        return false;
    });

    if (!exercise) return false;
    const sortedSets = exercise.sessionSets.sort(
        (a, b) => a.position - b.position,
    );
    return sortedSets[sortedSets.length - 1]?.uuid === sessionSetUuid;
}

export function getPreviousExerciseLastSet(
    workoutSession,
    currentExerciseUuid,
) {
    if (!workoutSession) return null;

    const exercises = workoutSession.sessionExercises || [];
    const currentExerciseIndex = exercises.findIndex(
        (ex) => ex.uuid === currentExerciseUuid,
    );

    if (currentExerciseIndex <= 0) return null;

    const previousExercise = exercises[currentExerciseIndex - 1];
    const lastSet =
        previousExercise.sessionSets?.[previousExercise.sessionSets.length - 1];

    return lastSet || null;
}

export function getNextExerciseFirstSet(workoutSession, currentExerciseUuid) {
    if (!workoutSession) return null;

    const exercises = workoutSession.sessionExercises || [];
    const currentExerciseIndex = exercises.findIndex(
        (ex) => ex.uuid === currentExerciseUuid,
    );

    if (
        currentExerciseIndex < 0 ||
        currentExerciseIndex >= exercises.length - 1
    )
        return null;

    const nextExercise = exercises[currentExerciseIndex + 1];
    const firstSet = nextExercise.sessionSets?.[0];

    return firstSet || null;
}

export function getWeightForCurrentSet(workoutSession, sessionSetUuid) {
    const set = workoutSession?.sessionExercises
        ?.flatMap((ex) => ex.sessionSets)
        ?.find((set) => set.uuid === sessionSetUuid);
    return set?.weight || null;
}

export function getRepsForCurrentSet(workoutSession, sessionSetUuid) {
    const set = workoutSession?.sessionExercises
        ?.flatMap((ex) => ex.sessionSets)
        ?.find((set) => set.uuid === sessionSetUuid);
    return set?.reps || null;
}

export function getRestPeriodForCurrentSet(workoutSession, sessionSetUuid) {
    const set = UuidHelper.findDeep(workoutSession, sessionSetUuid);
    return set?.restPeriodDuration || 0;
}

export function getWarmUpForCurrentExercise(workoutSession, exerciseUuid) {
    const exercise = UuidHelper.findDeep(workoutSession, exerciseUuid);
    return exercise?.warmUpDuration || 0;
}

export function isDuringWarmUp(workoutSession, exerciseUuid) {
    const exercise = workoutSession?.sessionExercises?.find(
        (ex) => ex.uuid === exerciseUuid,
    );
    if (!exercise) return false;
    return exercise.warmUpStartedAt && !exercise.warmUpEndedAt;
}

export function isDuringRestPeriod(workoutSession, sessionSetUuid) {
    const set = workoutSession?.sessionExercises
        ?.flatMap((ex) => ex.sessionSets)
        ?.find((set) => set.uuid === sessionSetUuid);
    if (!set) return false;
    return set.restPeriodStartedAt && !set.restPeriodEndedAt;
}

export function isWarmUpStarted(workoutSession, exerciseUuid) {
    const exercise = workoutSession?.sessionExercises?.find(
        (ex) => ex.uuid === exerciseUuid,
    );
    return !!exercise?.warmUpStartedAt;
}

export function isWarmUpEnded(workoutSession, exerciseUuid) {
    const exercise = workoutSession?.sessionExercises?.find(
        (ex) => ex.uuid === exerciseUuid,
    );
    return !!exercise?.warmUpEndedAt;
}

export function isRestPeriodStarted(workoutSession, sessionSetUuid) {
    const set = workoutSession?.sessionExercises
        ?.flatMap((ex) => ex.sessionSets)
        ?.find((set) => set.uuid === sessionSetUuid);
    return !!set?.restPeriodStartedAt;
}

export function isRestPeriodFinished(workoutSession, sessionSetUuid) {
    const set = workoutSession?.sessionExercises
        ?.flatMap((ex) => ex.sessionSets)
        ?.find((set) => set.uuid === sessionSetUuid);
    return !!set?.restPeriodEndedAt;
}

export function getWarmUpTimeRemaining(workoutSession, exerciseUuid) {
    const exercise = workoutSession?.sessionExercises?.find(
        (ex) => ex.uuid === exerciseUuid,
    );
    if (!exercise?.warmUpStartedAt || exercise.warmUpEndedAt) {
        return null;
    }

    const expectedDuration = exercise.warmUpDuration || 0;
    const startTime = new Date(exercise.warmUpStartedAt);
    return getSecondsRemaining({ expectedDuration, startTime });
}

export function getRestPeriodTimeRemaining(workoutSession, sessionSetUuid) {
    const set = workoutSession?.sessionExercises
        ?.flatMap((ex) => ex.sessionSets)
        ?.find((set) => set.uuid === sessionSetUuid);

    if (!set?.restPeriodStartedAt || set.restPeriodEndedAt) {
        return null;
    }

    const expectedDuration = set.restPeriodDuration || 0;
    const startTime = new Date(set.restPeriodStartedAt);
    return getSecondsRemaining({ expectedDuration, startTime });
}

export function useWorkoutSession(workoutSessionUuid) {
    const appStore = useAppStore();

    const { data, isPending, error } = useQuery({
        queryKey: computed(() => [
            WORKOUT_SESSION_KEY,
            toValue(workoutSessionUuid),
        ]),
        queryFn: async () => {
            const uuid = toValue(workoutSessionUuid);
            if (!uuid) {
                return null;
            }

            if (appStore.localOnlyUser) {
                // For local-only users, find in local storage
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const localSession = parsed.myWorkoutSessions?.find(
                        (session) => session.uuid === uuid,
                    );
                    return localSession || null;
                }
                return null;
            }

            const response = await WorkoutSessionService.get(uuid);
            return response.data;
        },
        enabled: computed(() => !!toValue(workoutSessionUuid)),
    });

    return {
        workoutSession: data,
        isPending,
        error,
    };
}

export function useWorkoutSessionBySet(sessionSetUuid) {
    const appStore = useAppStore();
    const queryClient = useQueryClient();

    const { data, isPending, error } = useQuery({
        queryKey: computed(() => [
            WORKOUT_SESSION_BY_SET_KEY,
            toValue(sessionSetUuid),
        ]),
        queryFn: async () => {
            const uuid = toValue(sessionSetUuid);
            if (!uuid) {
                return null;
            }

            if (appStore.localOnlyUser) {
                // For local-only users, find in local storage
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const localSession = parsed.myWorkoutSessions?.find(
                        (session) =>
                            UuidHelper.findDeep(session, uuid) !== undefined,
                    );

                    // Also populate the main cache
                    if (localSession) {
                        queryClient.setQueryData(
                            [WORKOUT_SESSION_KEY, localSession.uuid],
                            localSession,
                        );
                    }

                    return localSession || null;
                }
                return null;
            }

            const response = await WorkoutSessionService.getBySet(uuid);

            // Also populate the main workout session cache
            if (response.data) {
                queryClient.setQueryData(
                    [WORKOUT_SESSION_KEY, response.data.uuid],
                    response.data,
                );
            }

            return response.data;
        },
        enabled: computed(() => !!toValue(sessionSetUuid)),
    });

    return {
        workoutSession: data,
        isPending,
        error,
    };
}

export function useExerciseHistory(sessionExerciseUuid) {
    const { data, isPending, error } = useQuery({
        queryKey: computed(() => [
            EXERCISE_HISTORY_KEY,
            toValue(sessionExerciseUuid),
        ]),
        queryFn: async () => {
            const uuid = toValue(sessionExerciseUuid);
            if (!uuid) {
                return null;
            }

            const response = await SessionExerciseService.getHistory(uuid);
            return response.data;
        },
        enabled: computed(() => !!toValue(sessionExerciseUuid)),
    });

    return {
        exerciseHistory: data,
        isPending,
        error,
    };
}

export function useStartWorkout() {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ originWorkout, myWorkoutSessions }) => {
            const appStore = useAppStore();

            const existingCheckIn = myWorkoutSessions.find(
                (session) => isToday(session.createdAt) && !session.startedAt,
            );

            // Create a new workout session from the routine
            const sessionData = createSessionFromBuilderWorkout({
                existingCheckIn,
                originWorkout,
            });

            // Save the session
            if (appStore.localOnlyUser) {
                sessionData.updatedAt = utcNow();
                sessionData.createdAt = sessionData.createdAt || utcNow();
                return sessionData;
            } else {
                const response = await WorkoutSessionService.save(sessionData);
                return response.data;
            }
        },

        onSuccess: (workoutSession) => {
            // Update the workout session cache
            queryClient.setQueryData(
                [WORKOUT_SESSION_KEY, workoutSession.uuid],
                workoutSession,
            );

            // Save to localStorage
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : {};
            const myWorkoutSessions = parsed.myWorkoutSessions || [];

            const updatedSessions = UuidHelper.replaceInCopy(
                myWorkoutSessions,
                workoutSession,
                true,
            );

            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({
                    ...parsed,
                    workoutSession,
                    myWorkoutSessions: updatedSessions,
                }),
            );
        },

        onError: (error) => {
            console.error('Error starting workout:', error);
        },
    });

    return {
        startWorkout: mutate,
        isStarting: isPending,
    };
}

export function useUpdateWorkoutSession() {
    const queryClient = useQueryClient();
    const appStore = useAppStore();

    const { mutate, mutateAsync } = useMutation({
        mutationFn: async (workoutSession) => {
            if (appStore.localOnlyUser) {
                workoutSession.updatedAt = utcNow();
                workoutSession.createdAt = workoutSession.createdAt || utcNow();
                return workoutSession;
            } else {
                const response =
                    await WorkoutSessionService.save(workoutSession);
                return response.data;
            }
        },

        onMutate: async (workoutSession) => {
            const queryKey = [WORKOUT_SESSION_KEY, workoutSession.uuid];

            await queryClient.cancelQueries({ queryKey });

            const previousWorkoutSession = queryClient.getQueryData(queryKey);

            // Update the main cache
            queryClient.setQueryData(queryKey, workoutSession);

            // Also update any by-set caches that contain this session
            // Find all sets in this session and update their caches
            // Each cache entry gets a fresh clone to ensure reactivity
            const allSets = getAllSets(workoutSession);
            allSets.forEach((set) => {
                const bySetKey = [WORKOUT_SESSION_BY_SET_KEY, set.uuid];
                queryClient.setQueryData(
                    bySetKey,
                    JSON.parse(JSON.stringify(workoutSession)),
                );
            });

            // Save to localStorage
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : {};
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({
                    ...parsed,
                    workoutSession,
                }),
            );

            return { previousWorkoutSession, queryKey };
        },

        onError: (err, workoutSession, context) => {
            if (context?.previousWorkoutSession) {
                queryClient.setQueryData(
                    context.queryKey,
                    context.previousWorkoutSession,
                );

                // Also rollback by-set caches with fresh clones
                const allSets = getAllSets(context.previousWorkoutSession);
                allSets.forEach((set) => {
                    const bySetKey = [WORKOUT_SESSION_BY_SET_KEY, set.uuid];
                    queryClient.setQueryData(
                        bySetKey,
                        JSON.parse(
                            JSON.stringify(context.previousWorkoutSession),
                        ),
                    );
                });
            }
        },

        onSuccess: (response, workoutSession, context) => {
            // Deep clone to ensure new object reference
            const clonedResponse = JSON.parse(JSON.stringify(response));

            // Update main cache
            queryClient.setQueryData(context.queryKey, clonedResponse);

            // Also update by-set caches with new clones for each
            const allSets = getAllSets(clonedResponse);
            allSets.forEach((set) => {
                const bySetKey = [WORKOUT_SESSION_BY_SET_KEY, set.uuid];
                // Each cache entry gets a fresh clone to ensure reactivity
                queryClient.setQueryData(
                    bySetKey,
                    JSON.parse(JSON.stringify(clonedResponse)),
                );
            });

            // Update localStorage with server response
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : {};
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({
                    ...parsed,
                    workoutSession: clonedResponse,
                }),
            );
        },
    });

    // Core update functions that call mutate
    const updateWorkoutSession = (updates) => {
        const currentSession = queryClient.getQueryData([
            WORKOUT_SESSION_KEY,
            updates.uuid,
        ]);

        const updatedSession = {
            ...currentSession,
            ...updates,
        };

        return mutateAsync(updatedSession);
    };

    const updateSet = (sessionUuid, setUuid, updates) => {
        const currentSession = queryClient.getQueryData([
            WORKOUT_SESSION_KEY,
            sessionUuid,
        ]);

        const updatedSession = JSON.parse(JSON.stringify(currentSession));
        updatedSession.sessionExercises?.forEach((exercise) => {
            exercise.sessionSets?.forEach((set) => {
                if (set.uuid === setUuid) {
                    Object.assign(set, updates);
                }
            });
        });

        return mutateAsync(updatedSession);
    };

    const updateExercise = (sessionUuid, exerciseUuid, updates) => {
        const currentSession = queryClient.getQueryData([
            WORKOUT_SESSION_KEY,
            sessionUuid,
        ]);

        const updatedSession = JSON.parse(JSON.stringify(currentSession));
        updatedSession.sessionExercises?.forEach((exercise) => {
            if (exercise.uuid === exerciseUuid) {
                Object.assign(exercise, updates);
            }
        });

        return mutateAsync(updatedSession);
    };

    // Return all methods
    return {
        updateWorkoutSession,
        updateSet,
        updateExercise,

        // Specific update methods
        updateSetWeight: (sessionUuid, setUuid, weight) => {
            return updateSet(sessionUuid, setUuid, { weight });
        },

        updateSetReps: (sessionUuid, setUuid, reps) => {
            return updateSet(sessionUuid, setUuid, { reps });
        },

        updateExerciseWarmUpDuration: (
            sessionUuid,
            exerciseUuid,
            warmUpDuration,
        ) => {
            return updateExercise(sessionUuid, exerciseUuid, {
                warmUpDuration,
            });
        },

        updateSetRestPeriodDuration: (
            sessionUuid,
            setUuid,
            restPeriodDuration,
        ) => {
            return updateSet(sessionUuid, setUuid, { restPeriodDuration });
        },

        updateExerciseNotes: (sessionUuid, exerciseUuid, notes) => {
            return updateExercise(sessionUuid, exerciseUuid, { notes });
        },

        updateExerciseSkipped: (sessionUuid, exerciseUuid, skipped) => {
            return updateExercise(sessionUuid, exerciseUuid, { skipped });
        },

        startSet: (sessionUuid, setUuid) => {
            return updateSet(sessionUuid, setUuid, { startedAt: utcNow() });
        },

        endSet: (sessionUuid, setUuid) => {
            return updateSet(sessionUuid, setUuid, { endedAt: utcNow() });
        },

        startWarmUp: (sessionUuid, exerciseUuid) => {
            updateExercise(sessionUuid, exerciseUuid, {
                warmUpStartedAt: utcNow(),
                warmUpEndedAt: null,
            });
        },

        endWarmUp: (sessionUuid, exerciseUuid) => {
            const currentSession = queryClient.getQueryData([
                WORKOUT_SESSION_KEY,
                sessionUuid,
            ]);

            const exercise = currentSession?.sessionExercises?.find(
                (ex) => ex.uuid === exerciseUuid,
            );

            if (!exercise) return;

            const warmUpEndedAt = utcNow();
            const warmUpDuration = differenceInSeconds(
                new Date(warmUpEndedAt),
                new Date(exercise.warmUpStartedAt),
            );

            updateExercise(sessionUuid, exerciseUuid, {
                warmUpEndedAt,
                warmUpDuration,
            });
        },

        startRestPeriod: (sessionUuid, setUuid) => {
            updateSet(sessionUuid, setUuid, {
                restPeriodStartedAt: utcNow(),
                restPeriodEndedAt: null,
            });
        },

        endRestPeriod: (sessionUuid, setUuid) => {
            const currentSession = queryClient.getQueryData([
                WORKOUT_SESSION_KEY,
                sessionUuid,
            ]);

            const set = currentSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((s) => s.uuid === setUuid);

            if (!set) return;

            const restPeriodEndedAt = utcNow();
            const restPeriodDuration = differenceInSeconds(
                new Date(restPeriodEndedAt),
                new Date(set.restPeriodStartedAt),
            );

            updateSet(sessionUuid, setUuid, {
                restPeriodEndedAt,
                restPeriodDuration,
            });
        },

        resetWarmUp: (sessionUuid, exerciseUuid) => {
            updateExercise(sessionUuid, exerciseUuid, {
                warmUpStartedAt: null,
                warmUpEndedAt: null,
                warmUpDuration: null,
            });
        },

        resetRestPeriod: (sessionUuid, setUuid) => {
            updateSet(sessionUuid, setUuid, {
                restPeriodStartedAt: null,
                restPeriodEndedAt: null,
                restPeriodDuration: null,
            });
        },

        endWorkout: (sessionUuid) => {
            const currentSession = queryClient.getQueryData([
                WORKOUT_SESSION_KEY,
                sessionUuid,
            ]);

            const endedAt = utcNow();

            const updatedSession = JSON.parse(JSON.stringify(currentSession));

            // End the workout
            const updatedLastExercise =
                updatedSession.sessionExercises[
                    updatedSession.sessionExercises.length - 1
                ];
            const updatedLastSet =
                updatedLastExercise.sessionSets[
                    updatedLastExercise.sessionSets.length - 1
                ];

            updatedLastSet.endedAt = endedAt;
            updatedLastExercise.endedAt = endedAt;
            updatedSession.endedAt = endedAt;

            mutate(updatedSession);
        },
    };
}

export function useDeleteWorkoutSession() {
    const queryClient = useQueryClient();
    const appStore = useAppStore();

    const { mutate } = useMutation({
        mutationFn: async (workoutSessionUuid) => {
            if (!appStore.localOnlyUser) {
                await WorkoutSessionService.delete(workoutSessionUuid);
            }
            return workoutSessionUuid;
        },

        onMutate: async (workoutSessionUuid) => {
            // Remove from cache
            queryClient.removeQueries([
                WORKOUT_SESSION_KEY,
                workoutSessionUuid,
            ]);

            // Remove from localStorage
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : {};
            const myWorkoutSessions = parsed.myWorkoutSessions || [];

            const updatedSessions = myWorkoutSessions.filter(
                (session) => session.uuid !== workoutSessionUuid,
            );

            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({
                    ...parsed,
                    myWorkoutSessions: updatedSessions,
                }),
            );

            return { workoutSessionUuid };
        },

        onError: (error) => {
            console.error('Error deleting workout session:', error);
        },
    });

    return {
        deleteWorkoutSession: mutate,
    };
}
