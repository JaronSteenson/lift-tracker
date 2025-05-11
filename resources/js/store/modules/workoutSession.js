import WorkoutSessionService from '../../api/WorkoutSessionService';
import UuidHelper from '../../UuidHelper';
import { utcNow } from '../../dates';
import { memoizeDebounceAction } from '../../util';
import { differenceInSeconds, isAfter } from 'date-fns';
import {
    mutations as saveStatusMutations,
    actions as saveStatusActions,
    state as saveStatusState,
} from './saveStatusMixin';
import createSessionFromBuilderWorkout from '../../domain/createSessionFromBuilderWorkout';

const SAVE_DEBOUNCE_WAIT = 1000;
const LOCAL_STORAGE_KEY = 'store-state--WorkoutSession';

function defaultState() {
    return {
        ...saveStatusState,
        workoutSession: {
            uuid: null,
            name: '',
            startedAt: null,
            endedAt: null,
            notes: null,
            sessionExercises: null,
            createdAt: null,
            updatedAt: null,
        },
        myWorkoutSessions: [],
        myMyWorkoutSessionsPagesLoaded: 0,
        myMyWorkoutSessionsPagesAllLoaded: false,
        exercisesPreviousEntries: {}, // Previous entries of exercises keyed by exercise uuid.
        inProgressWorkouts: [], // An array of workouts.
        timerTimeout: null,
        /**
         * A map of workout session ids to boolean, indicating if a session is open for retrospective editing.
         * Note this is only relevant to finished workouts.
         */
        openForEdits: {},
    };
}

const state = defaultState();

export const getters = {
    hasLoadedInProgressWorkouts(state, getters) {
        return Boolean(getters.inProgressWorkouts);
    },

    isOpenForEdits: (state, getters) => (workoutSessionUuid) => {
        if (getters.isInProgressWorkout(workoutSessionUuid)) {
            return true;
        }

        return state?.openForEdits?.[workoutSessionUuid];
    },

    isInProgressWorkout: (state, getters) => (workoutSessionUuid) => {
        if (!getters.inProgressWorkouts) {
            return false;
        }

        return UuidHelper.findIn(
            getters.inProgressWorkouts,
            workoutSessionUuid
        );
    },

    inProgressSet(state, getters) {
        if (getters.inProgressWorkouts.length === 0) {
            return null;
        }

        return getters.currentSetForInProgressWorkout(
            getters.inProgressWorkouts[0].uuid
        );
    },

    originRoutineUuid: (state) => (sessionUuid) => {
        const workoutSession = UuidHelper.findIn(
            state.myWorkoutSessions,
            sessionUuid
        );

        return workoutSession.workoutProgramRoutine.uuid;
    },

    /**
     * Flatten all sets from every exercise in a single array.
     */
    flattenAllSets: () => (workout) => {
        const setGroups = workout.sessionExercises.map((exercise) => {
            return exercise.sessionSets.map((set) => {
                return { exercise: exercise, ...set };
            });
        });

        return setGroups.reduce((accumulator, setGroup) => {
            accumulator.push(...setGroup);
            return accumulator;
        }, []);
    },

    currentSetForInProgressWorkout:
        (state, getters) => (workoutSessionUuid) => {
            if (!getters.inProgressWorkouts) {
                return null;
            }

            const workout = UuidHelper.findIn(
                getters.inProgressWorkouts,
                workoutSessionUuid
            );

            if (!workout) {
                return null;
            }

            const allSets = getters.flattenAllSets(workout);
            if (allSets[0].startedAt === null) {
                return allSets[0];
            }

            return allSets.reduce((lastStartedSet, set) => {
                if (set.startedAt === null) {
                    return lastStartedSet;
                }

                if (set.startedAt === lastStartedSet.startedAt) {
                    return set;
                }

                if (
                    isAfter(
                        new Date(set.startedAt),
                        new Date(lastStartedSet.startedAt)
                    )
                ) {
                    return set;
                }

                return lastStartedSet;
            }, allSets[0]);
        },

    inProgressWorkouts(state) {
        return state.inProgressWorkouts;
    },

    workoutSessionIsLoaded: (state, getters) => (uuid) => {
        return getters.uuid === uuid;
    },

    uuid(state) {
        return state.workoutSession.uuid;
    },

    workoutName(state) {
        return state.workoutSession.name;
    },

    workoutSession(state) {
        return state.workoutSession;
    },

    sessionExercises(state) {
        return state.workoutSession.sessionExercises;
    },

    notSkippedSessionExercises(state) {
        return state.workoutSession.sessionExercises.filter(
            ({ skipped }) => !skipped
        );
    },

    firstSet(state) {
        return state.workoutSession.sessionExercises[0].sessionSets[0];
    },

    setIsInFocusedSession: (state, getters) => (sessionSetUuid) => {
        if (state?.workoutSession?.sessionExercises) {
            const allSets = getters.flattenAllSets(state.workoutSession);

            return UuidHelper.arrayIncludes(allSets, sessionSetUuid);
        }

        return false;
    },

    set: (state, getters) => (uuid) => {
        const exercise = getters.exerciseBySet(uuid);

        return UuidHelper.findIn(exercise.sessionSets, uuid);
    },

    exerciseBySet: (state) => (uuid) => {
        const exercises = state.workoutSession.sessionExercises;

        return exercises.find((exercise) => {
            return UuidHelper.arrayIncludes(exercise.sessionSets, uuid);
        });
    },

    exercise: (state) => (uuid) => {
        return UuidHelper.findIn(state.workoutSession.sessionExercises, uuid);
    },

    previousSet: (state, getters) => (uuid) => {
        const currentSetsExercise = getters.exerciseBySet(uuid);

        // Look in our current exercise.
        let previousSetIndex = null;
        currentSetsExercise.sessionSets.forEach((set, index) => {
            if (set.uuid === uuid) {
                previousSetIndex = index - 1;
            }
        });

        const inSameExercise =
            currentSetsExercise.sessionSets[previousSetIndex];
        if (inSameExercise) {
            return inSameExercise;
        }

        // Look for the previous exercise instead then.
        let previousExerciseIndex = null;
        state.workoutSession.sessionExercises.forEach((exercise, index) => {
            if (exercise.uuid === currentSetsExercise.uuid) {
                previousExerciseIndex = index - 1;
            }
        });

        const inPreviousExercise =
            state.workoutSession.sessionExercises[previousExerciseIndex];
        if (inPreviousExercise) {
            return inPreviousExercise.sessionSets[
                inPreviousExercise.sessionSets.length - 1
            ];
        }

        // Must be on the first set of the workout
        return null;
    },

    nextSet: (state, getters) => (uuid) => {
        const currentSetsExercise = getters.exerciseBySet(uuid);

        // Look in our current exercise.
        let nextSetIndex = null;
        currentSetsExercise.sessionSets.forEach((set, index) => {
            if (set.uuid === uuid) {
                nextSetIndex = index + 1;
            }
        });

        const inSameExercise = currentSetsExercise.sessionSets[nextSetIndex];
        if (inSameExercise) {
            return inSameExercise;
        }

        // Look for the next exercise instead then.
        let nextExerciseIndex = null;
        state.workoutSession.sessionExercises.forEach((exercise, index) => {
            if (exercise.uuid === currentSetsExercise.uuid) {
                nextExerciseIndex = index + 1;
            }
        });

        const inNextExercise =
            state.workoutSession.sessionExercises[nextExerciseIndex];
        if (inNextExercise) {
            return inNextExercise.sessionSets[0];
        }

        // Must be finished the workout
        return null;
    },

    weightForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);
        return actualSet.weight;
    },

    warmUpForCurrentExercise: (state, getters) => (exerciseUuid) => {
        const actualExercise = getters.exercise(exerciseUuid);

        if (actualExercise.warmUpDuration) {
            return actualExercise.warmUpDuration;
        }

        return actualExercise.plannedWarmUp;
    },

    restPeriodForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.restPeriodDuration) {
            return actualSet.restPeriodDuration;
        }

        const exercise = getters.exerciseBySet(uuid);

        return exercise.plannedRestPeriodDuration;
    },

    repsForCurrentSet: (state, getters) => (setUuid) => {
        const actualSet = getters.set(setUuid);

        if (actualSet.reps) {
            return actualSet.reps;
        }

        return null;
    },

    isFirstSetOfWorkout: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        const firstExercise = state.workoutSession.sessionExercises[0];

        const firstSet = firstExercise.sessionSets[0];

        return actualSet.uuid === firstSet.uuid;
    },

    isLastSetOfWorkout: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        const lastExercise =
            state.workoutSession.sessionExercises[
                state.workoutSession.sessionExercises.length - 1
            ];
        const lastSet =
            lastExercise.sessionSets[lastExercise.sessionSets.length - 1];

        return actualSet.uuid === lastSet.uuid;
    },

    isFirstSetOfExercise: (state, getters) => (setUuid) => {
        const exercise = getters.exerciseBySet(setUuid);

        const firstExerciseOfSet = exercise.sessionSets[0];

        return setUuid === firstExerciseOfSet.uuid;
    },

    isLastSetOfExercise: (state, getters) => (setUuid) => {
        const exercise = getters.exerciseBySet(setUuid);

        const lastExerciseOfSet =
            exercise.sessionSets[exercise.sessionSets.length - 1];

        return setUuid === lastExerciseOfSet.uuid;
    },

    warmUpStarted: (state, getters) => (uuid) => {
        const exercise = getters.exercise(uuid);

        return Boolean(exercise.warmUpStartedAt);
    },

    warmUpEnded: (state, getters) => (uuid) => {
        const exercise = getters.exercise(uuid);

        return Boolean(exercise.warmUpEndedAt);
    },

    restPeriodStarted: (state, getters) => (uuid) => {
        const set = getters.set(uuid);

        return Boolean(set.restPeriodStartedAt);
    },

    isDuringWarmUp: (state, getters) => (exerciseUuid) => {
        const exercise = getters.exercise(exerciseUuid);
        return exercise.warmUpStartedAt && !exercise.warmUpEndedAt;
    },

    isDuringRestPeriod: (state, getters) => (uuid) => {
        const set = getters.set(uuid);
        return set.restPeriodStartedAt && !set.restPeriodEndedAt;
    },

    restPeriodIsFinished: (state, getters) => (uuid) => {
        const set = getters.set(uuid);

        return set.restPeriodStartedAt && set.restPeriodEndedAt;
    },

    warmUpTimeRemaining: (state, getters) => (exerciseUuid) => {
        if (!getters.isDuringWarmUp(exerciseUuid)) {
            return null;
        }

        const expectedDuration = getters.warmUpForCurrentExercise(exerciseUuid);

        const exercise = getters.exercise(exerciseUuid);
        let startTime = new Date(exercise.warmUpStartedAt);

        return getSecondsRemaining({ expectedDuration, startTime });
    },

    restPeriodTimeRemaining: (state, getters) => (uuid) => {
        if (!getters.isDuringRestPeriod(uuid)) {
            return null;
        }

        const expectedDuration = getters.restPeriodForCurrentSet(uuid);
        let startTime = new Date(getters.set(uuid).restPeriodStartedAt);

        return getSecondsRemaining({ expectedDuration, startTime });
    },

    hasLoadedExercisePreviousEntries: (state) => (exerciseUuid) => {
        return (
            typeof state.exercisesPreviousEntries[exerciseUuid] !== 'undefined'
        );
    },

    exercisePreviousEntries: (state) => (exerciseUuid) => {
        return state.exercisesPreviousEntries[exerciseUuid] || [];
    },

    updatedAt(state) {
        return state.workoutSession.updatedAt;
    },

    forLocalStorageSave(state) {
        return {
            ...state,
            myWorkoutSessions: state.myWorkoutSessions.slice(0, 50),
        };
    },

    fromLocalStorage() {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    },
};

export const actions = {
    ...saveStatusActions,

    updateBodyWeight({ commit, dispatch }, { bodyWeight }) {
        commit('updateWorkoutSession', { bodyWeight });
        dispatch('saveWorkout');
    },
    updateSetWeight({ commit, dispatch, getters }, { uuid, weight }) {
        commit('updateSet', { uuid, weight });

        // If we are in progress, update the upcoming sets as well as this set.
        if (getters.isInProgressWorkout) {
            const exercise = getters.exerciseBySet(uuid);

            exercise.sessionSets.forEach((set) => {
                if (set.uuid !== uuid && set.startedAt === null) {
                    commit('updateSet', { uuid: set.uuid, weight });
                }
            });

            dispatch('saveExercise', exercise.uuid);
        } else {
            dispatch('saveSet', uuid);
        }
    },

    updateExerciseWarmUpDuration(
        { commit, dispatch },
        { uuid, warmUpDuration }
    ) {
        commit('updateExercise', { uuid, warmUpDuration });

        dispatch('saveExercise', uuid);
    },

    updateSetRestPeriodDuration(
        { commit, dispatch },
        { uuid, restPeriodDuration }
    ) {
        commit('updateSet', { uuid, restPeriodDuration });

        dispatch('saveSet', uuid);
    },

    updateSetReps({ commit, dispatch }, { uuid, reps }) {
        commit('updateSet', { uuid, reps });

        dispatch('saveSet', uuid);
    },

    updateExerciseNotes({ commit, dispatch }, { uuid, notes }) {
        commit('updateExercise', { uuid, notes });

        dispatch('saveExercise', uuid);
    },

    updateExerciseSkipped({ commit, dispatch }, { uuid, skipped }) {
        commit('updateExercise', { uuid, skipped });

        dispatch('saveExercise', uuid);
    },

    startSet({ commit, dispatch }, { uuid }) {
        const now = utcNow();

        commit('startSet', { uuid, startedAt: now });

        dispatch('saveSet', uuid);
    },

    endSet({ commit, dispatch }, { uuid }) {
        commit('updateSet', { uuid, endedAt: utcNow() });

        dispatch('saveSet', uuid);
    },

    skipExercise({ commit, dispatch }, { uuid }) {
        commit('skipExercise', { uuid });

        dispatch('saveExercise', uuid);
    },

    startWarmUp({ commit, dispatch }, { uuid }) {
        const warmUpStartedAt = utcNow();

        commit('updateExercise', {
            uuid,
            warmUpStartedAt,
            warmUpEndedAt: null,
        });

        dispatch('saveExercise', uuid);
    },

    startRestPeriod({ commit, dispatch }, { uuid }) {
        const restPeriodStartedAt = utcNow();

        commit('updateSet', {
            uuid,
            restPeriodStartedAt,
            restPeriodEndedAt: null,
        });

        dispatch('saveSet', uuid);
    },

    resetWarmUp({ commit, dispatch }, { uuid }) {
        commit('updateExercise', {
            uuid,
            warmUpStartedAt: null,
            warmUpEndedAt: null,
            warmUpDuration: null,
        });

        dispatch('saveExercise', uuid);
    },

    resetRestPeriod({ commit, dispatch }, { uuid }) {
        commit('updateSet', {
            uuid,
            restPeriodStartedAt: null,
            restPeriodEndedAt: null,
            restPeriodDuration: null,
        });

        dispatch('saveSet', uuid);
    },

    endWarmUp({ commit, dispatch, getters }, { uuid }) {
        const exercise = getters.exercise(uuid);

        const warmUpEndedAt = utcNow();
        const warmUpDuration = differenceInSeconds(
            new Date(warmUpEndedAt),
            new Date(exercise.warmUpStartedAt)
        );
        commit('endWarmUp', {
            uuid,
            warmUpEndedAt,
            warmUpDuration,
        });

        dispatch('saveExercise', uuid);
    },

    endRestPeriod({ commit, dispatch, getters }, { uuid }) {
        const set = getters.set(uuid);

        const restPeriodEndedAt = utcNow();
        const restPeriodDuration = differenceInSeconds(
            new Date(restPeriodEndedAt),
            new Date(set.restPeriodStartedAt)
        );
        commit('endRestPeriod', {
            uuid,
            restPeriodEndedAt,
            restPeriodDuration,
        });

        dispatch('saveSet', uuid);
    },

    updateOpenForEditsStatus({ state, commit }, { workoutSessionUuid, value }) {
        commit('reset', {
            openForEdits: {
                ...state.openForEdits,
                [workoutSessionUuid]: value,
            },
        });
    },

    async delete({ state, commit, dispatch, rootGetters }, uuidToDelete) {
        try {
            const updatedWorkoutSessions = UuidHelper.removeFromCopy(
                state.myWorkoutSessions,
                uuidToDelete
            );
            const updatedInProgressWorkouts = UuidHelper.removeFromCopy(
                state.inProgressWorkouts,
                uuidToDelete
            );

            // Optimistically remove from the state.
            commit('reset', {
                myWorkoutSessions: updatedWorkoutSessions,
                inProgressWorkouts: updatedInProgressWorkouts,
            });

            if (!rootGetters['app/userIsLocalOnly']) {
                await WorkoutSessionService.delete(uuidToDelete);
            }
        } catch (error) {
            console.error(error);
            dispatch('finishSavingError');

            // Rollback the remove from the state.
            commit('reset', {
                myWorkoutSessions: state.myWorkoutSessions,
                inProgressWorkouts: state.inProgressWorkouts,
            });
        }
    },

    /**
     * Save a set debounced per unique uuid.
     *
     * @param commit
     * @param getters
     * @param dispatch
     * @param uuid The sets uuid
     * @return {Promise<void>}
     */
    saveSet: memoizeDebounceAction(
        async ({ commit, getters, dispatch, rootGetters }, uuid) => {
            try {
                dispatch('startSaving');

                commit('updateSet', {
                    uuid,
                    updatedAt: utcNow(),
                });
                commit('updateWorkoutSession', {
                    uuid: getters.uuid,
                    updatedAt: utcNow(),
                });

                const set = getters.set(uuid);

                if (!rootGetters['app/userIsLocalOnly']) {
                    const response = await WorkoutSessionService.saveSet(set);

                    commit('updateWorkoutSession', {
                        uuid: getters.uuid,
                        updatedAt: response.data.updatedAt,
                    });

                    commit('updateSet', {
                        uuid,
                        updatedAt: response.data.updatedAt,
                        createdAt: response.data.createdAt,
                    });
                }

                dispatch('saveToLocalStorage');
                dispatch('finishSaving');
            } catch (error) {
                dispatch('finishSavingError');
                console.error(error);
            }
        },
        SAVE_DEBOUNCE_WAIT
    ),

    saveExercise: memoizeDebounceAction(
        async ({ commit, getters, dispatch, rootGetters }, uuid) => {
            try {
                dispatch('startSaving');

                commit('updateExercise', {
                    uuid,
                });

                if (!rootGetters['app/userIsLocalOnly']) {
                    const response = await WorkoutSessionService.saveExercise(
                        getters.exercise(uuid)
                    );

                    commit('updateWorkoutSession', {
                        updatedAt: response.data.updatedAt,
                    });

                    commit('updateExercise', {
                        uuid,
                        updatedAt: response.data.updatedAt,
                        createdAt: response.data.createdAt,
                    });
                }

                dispatch('saveToLocalStorage');
                dispatch('finishSaving');
            } catch (error) {
                dispatch('finishSavingError');
                console.error(error);
            }
        },
        SAVE_DEBOUNCE_WAIT
    ),

    async saveWorkout({ commit, state, dispatch, rootGetters }) {
        try {
            dispatch('startSaving');

            commit('updateWorkoutSession', {});
            dispatch('saveToLocalStorage');

            if (!rootGetters['app/userIsLocalOnly']) {
                const response = await WorkoutSessionService.save(
                    state.workoutSession
                );

                commit('updateWorkoutSession', {
                    updatedAt: response.data.updatedAt,
                    createdAt: response.data.createdAt,
                });
            }

            dispatch('finishSaving');
        } catch (error) {
            dispatch('finishSavingError');
            console.error(error);
        }
    },

    saveToLocalStorage({ getters }) {
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(getters.forLocalStorageSave)
        );
    },

    async fetch({ commit, rootGetters }, uuid) {
        if (rootGetters['app/userIsLocalOnly']) {
            return undefined;
        }

        const response = await WorkoutSessionService.get(uuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    /**
     * @return {Promise<*>}
     */
    async fetchNextPage({ commit, state, rootGetters }) {
        if (rootGetters['app/userIsLocalOnly']) {
            commit('reset', {
                myMyWorkoutSessionsPagesAllLoaded: true,
            });
            return [];
        }

        const nextPage = state.myMyWorkoutSessionsPagesLoaded + 1;
        const response = await WorkoutSessionService.index(nextPage);

        commit('reset', {
            myWorkoutSessions: [...state.myWorkoutSessions, ...response.data],
            myMyWorkoutSessionsPagesLoaded: nextPage,
            myMyWorkoutSessionsPagesAllLoaded:
                response.data.length < WorkoutSessionService.getPageSize(),
        });

        return response;
    },

    async fetchBySet({ commit, rootGetters }, sessionSetUuid) {
        if (rootGetters['app/userIsLocalOnly']) {
            return undefined;
        }

        const response = await WorkoutSessionService.getBySet(sessionSetUuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    async fetchInProgressWorkouts({ commit, rootGetters }) {
        if (rootGetters['app/userIsLocalOnly']) {
            return [];
        }

        const response = await WorkoutSessionService.getInProgressWorkouts();
        commit('reset', { inProgressWorkouts: response.data });
        return response;
    },

    async fetchExercisePreviousEntries(
        { state, commit, rootGetters },
        exerciseUuid
    ) {
        let previousEntries;
        if (rootGetters['app/userIsLocalOnly']) {
            previousEntries = state.myWorkoutSessions
                .reduce((carry, workoutSession) => {
                    const matchingExercises =
                        workoutSession.sessionExercises.filter(
                            (exercise) => exercise.uuid === exerciseUuid
                        );

                    return [...carry, ...matchingExercises];
                }, [])
                .sort(
                    (a, b) =>
                        a.sessionSets[0].startedAt - b.sessionSets[0].startedAt
                );
        } else {
            const response =
                await WorkoutSessionService.getExercisePreviousEntries(
                    exerciseUuid
                );

            previousEntries = response.data.reverse();
        }

        commit('updateExercisePreviousEntries', {
            exerciseUuid,
            previousEntries,
        });
    },

    async startWorkout(
        { commit, state, dispatch, rootGetters },
        { originWorkout }
    ) {
        let workoutSession = createSessionFromBuilderWorkout({
            originWorkout,
        });

        const originalState = defaultState();
        const update = {
            workoutSession,
            inProgressWorkouts: [...state.inProgressWorkouts, workoutSession],
            myWorkoutSessions: [workoutSession, ...state.myWorkoutSessions],
            exercisesPreviousEntries: originalState.exercisesPreviousEntries,
        };
        commit('reset', update);

        // Save updates to the master workout routine.
        await dispatch('programBuilder/saveIfDirty', undefined, { root: true });

        // We must wait for the master routine to be updated,
        // so we can link any new session exercises to their builder counterparts.
        if (!rootGetters['app/userIsLocalOnly']) {
            workoutSession = (await WorkoutSessionService.save(workoutSession))
                .data;
        }

        const updateFromServer = {
            workoutSession,
            inProgressWorkouts: UuidHelper.replaceInCopy(
                state.inProgressWorkouts,
                workoutSession
            ),
            myWorkoutSessions: UuidHelper.replaceInCopy(
                state.myWorkoutSessions,
                workoutSession
            ),
        };
        commit('reset', updateFromServer);
        dispatch('saveToLocalStorage');
    },

    async endWorkout({ commit, dispatch, getters }) {
        const endedAt = utcNow();

        const lastExercise =
            state.workoutSession.sessionExercises[
                state.workoutSession.sessionExercises.length - 1
            ];
        const lastSet =
            lastExercise.sessionSets[lastExercise.sessionSets.length - 1];

        // TODO combine set and workout save (just save everything in one hit).
        commit('endSet', { uuid: lastSet.uuid, endedAt });
        dispatch('saveSet', lastSet.uuid);

        const workoutSession = { ...getters.workoutSession, endedAt };
        commit('reset', { workoutSession });

        const save = await dispatch('saveWorkout');
        dispatch('fetchInProgressWorkouts');

        return save;
    },
};

const mutations = {
    ...saveStatusMutations,

    restoreDefault(state) {
        const originalState = defaultState();

        Object.keys(originalState).forEach((key) => {
            state[key] = originalState[key];
        });
    },

    reset(state, newState) {
        Object.keys(newState || {}).forEach((key) => {
            state[key] = newState[key];
        });
    },

    updateWorkoutSession(state, newWorkoutSessionState) {
        Object.keys(newWorkoutSessionState).forEach((key) => {
            state.workoutSession[key] = newWorkoutSessionState[key];
        });

        if (!newWorkoutSessionState.updatedAt) {
            state.workoutSession.updatedAt = utcNow();
            state.workoutSession.createdAt =
                state.workoutSession.createdAt || utcNow();
        }

        state.workoutSession = { ...state.workoutSession };

        state.inProgressWorkouts = !state.workoutSession.endedAt
            ? UuidHelper.replaceInCopy(
                  state.inProgressWorkouts,
                  state.workoutSession
              )
            : state.inProgressWorkouts.filter((inProgressWorkout) => {
                  return state.workoutSession.uuid !== inProgressWorkout.uuid;
              });

        state.myWorkoutSessions = UuidHelper.replaceInCopy(
            state.myWorkoutSessions,
            state.workoutSession
        );
    },

    updateSet(state, newSetState) {
        const set = UuidHelper.findDeep(
            state.workoutSession.sessionExercises,
            newSetState.uuid
        );

        Object.keys(newSetState).forEach((key) => {
            set[key] = newSetState[key];
        });

        if (!newSetState.updatedAt) {
            set.updatedAt = utcNow();
            set.createdAt = set.createdAt || utcNow();
        }

        state.workoutSession = { ...state.workoutSession };
    },

    updateExercise(state, newExerciseState) {
        const exercise = UuidHelper.findIn(
            state.workoutSession.sessionExercises,
            newExerciseState.uuid
        );

        Object.keys(newExerciseState).forEach((key) => {
            exercise[key] = newExerciseState[key];
        });

        if (!newExerciseState.updatedAt) {
            exercise.updatedAt = utcNow();
            exercise.createdAt = exercise.createdAt || utcNow();
        }

        state.workoutSession = { ...state.workoutSession };
    },

    skipExercise(state, { uuid }) {
        const exercise = UuidHelper.findIn(
            state.workoutSession.sessionExercises,
            uuid
        );

        exercise.skipped = true;
        exercise.sessionSets.forEach((set) => {
            set.endedAt = utcNow();

            const inProgressSet = UuidHelper.findDeep(
                state.inProgressWorkouts,
                set.uuid
            );
            inProgressSet.endedAt = set.endedAt;
        });
    },

    updateExercisePreviousEntries(state, { exerciseUuid, previousEntries }) {
        state.exercisesPreviousEntries[exerciseUuid] = previousEntries;
    },

    startSet(state, { uuid, startedAt }) {
        const set = UuidHelper.findDeep(
            state.workoutSession.sessionExercises,
            uuid
        );
        const inProgressSet = UuidHelper.findDeep(
            state.inProgressWorkouts,
            uuid
        );

        set.startedAt = startedAt;
        inProgressSet.startedAt = startedAt;
    },

    endSet(state, { uuid, endedAt }) {
        const set = UuidHelper.findDeep(
            state.workoutSession.sessionExercises,
            uuid
        );
        const inProgressSet = UuidHelper.findDeep(
            state.inProgressWorkouts,
            uuid
        );

        set.endedAt = endedAt;
        inProgressSet.endedAt = endedAt;
    },

    endWarmUp(state, { uuid, warmUpEndedAt, warmUpDuration }) {
        const exercise = UuidHelper.findIn(
            state.workoutSession.sessionExercises,
            uuid
        );

        exercise.warmUpEndedAt = warmUpEndedAt;
        exercise.warmUpDuration = warmUpDuration;

        clearTimeout(state.timerTimeout);
        state.timerTimeout = null;
    },

    endRestPeriod(state, { uuid, restPeriodEndedAt, restPeriodDuration }) {
        const set = UuidHelper.findDeep(
            state.workoutSession.sessionExercises,
            uuid
        );
        set.restPeriodEndedAt = restPeriodEndedAt;
        set.restPeriodDuration = restPeriodDuration;

        clearTimeout(state.timerTimeout);
        state.timerTimeout = null;
    },

    endWorkout(state, { endedAt }) {
        state.workoutSession.endedAt = endedAt;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};

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
