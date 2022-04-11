import WorkoutSessionService from '../../api/WorkoutSessionService';
import UuidHelper from '../../UuidHelper';
import { dateDescription, utcNow } from '../../dates';
import { memoizeDebounceAction } from "../../util";
import { differenceInSeconds, isAfter } from 'date-fns';
import {
    mutations as saveStatusMutations,
    actions as saveStatusActions,
    state as saveStatusState,
    getters as savingStatusGetters,
} from './saveStatusMixin';

const SAVE_DEBOUNCE_WAIT = 1000;

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
        inProgressWorkouts: null, // An array of workouts.
        restPeriodTimout: null,
        /**
         * A map of workout session ids to boolean, indicating if a session is open for retrospective editing.
         * Note this is only relevant to finished workouts.
         */
        openForEdits: new Map(),
    }
}

const state = defaultState();

export const getters = {
    ...savingStatusGetters,

    hasLoadedInProgressWorkouts(state, getters) {
        return getters.inProgressWorkouts !== null;
    },

    hasLoadedFirstPage(state) {
        return state.myMyWorkoutSessionsPagesLoaded > 0;
    },

    myWorkoutSessions(state, getters) {
        if (state.myWorkoutSessions === null) {
            return null;
        }

        return state.myWorkoutSessions.map(workoutSession => {
            let startedAt = dateDescription(workoutSession.startedAt);

            if (getters.isInProgressWorkout(workoutSession.uuid)) {
                startedAt = `${startedAt} (in progress)`;
            }

            const workoutProgram = workoutSession?.workoutProgramRoutine?.workoutProgram;
            const programName = workoutProgram ? workoutProgram.name : '(Archived program)'
            const originProgramUuid = workoutProgram ? workoutProgram.uuid : null;

            return {
                ...workoutSession,
                ...{
                    startedAt,
                    programName,
                    originProgramUuid,
                },
            };
        })
    },

    isOpenForEdits: (state, getters) => (workoutSessionUuid) => {
        if (getters.isInProgressWorkout(workoutSessionUuid)) {
            return true;
        }

        return state.openForEdits.get(workoutSessionUuid) === true;
    },

    isInProgressWorkout: (state, getters) => (workoutSessionUuid) => {
        return UuidHelper.findIn(getters.inProgressWorkouts, workoutSessionUuid);
    },

    inProgressSet(state, getters) {
        if (getters.inProgressWorkouts.length === 0) {
            return null;
        }

        return getters.currentSetForInProgressWorkout(getters.inProgressWorkouts[0].uuid);
    },

    originRoutineUuid:  (state) => (sessionUuid) => {
        const workoutSession = UuidHelper.findIn(state.myWorkoutSessions, sessionUuid);

        return workoutSession.workoutProgramRoutine.uuid;
    },

    /**
     * Flatten all sets from every exercise in a single array.
     */
    flattenAllSets: () => workout => {
        const setGroups = workout.sessionExercises.map(exercise => {
            return exercise.sessionSets.map(set => {
                return {exercise: exercise, ...set}
            })
        });

        return setGroups.reduce((accumulator, setGroup) => {
            accumulator.push(...setGroup);
            return accumulator;
        }, [])
    },

    currentSetForInProgressWorkout: (state, getters) => (workoutSessionUuid) => {
        const workout =  UuidHelper.findIn(getters.inProgressWorkouts, workoutSessionUuid);

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

            if (isAfter(new Date(set.startedAt), new Date(lastStartedSet.startedAt))) {
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

    firstSet(state) {
        return state.workoutSession.sessionExercises[0].sessionSets[0]
    },

    setIsInFocusedSession: (state, getters) => (sessionSetUuid) => {
        if (state?.workoutSession?.sessionExercises) {
            const allSets = getters.flattenAllSets(state.workoutSession);

            return UuidHelper.arrayIncludes(allSets, sessionSetUuid)
        }

        return false;
    },

    set: (state, getters) => (uuid) => {
        const exercise = getters.exerciseBySet(uuid);

        return UuidHelper.findIn(exercise.sessionSets, uuid);
    },

    exerciseBySet: (state) => (uuid) => {
        const exercises = state.workoutSession.sessionExercises;

        return exercises.find(exercise => {
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
        })

        const inSameExercise = currentSetsExercise.sessionSets[previousSetIndex];
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

        const inPreviousExercise = state.workoutSession.sessionExercises[previousExerciseIndex];
        if (inPreviousExercise) {
            return inPreviousExercise.sessionSets[inPreviousExercise.sessionSets.length - 1];
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
        })

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
        })

        const inNextExercise = state.workoutSession.sessionExercises[nextExerciseIndex];
        if (inNextExercise) {
            return inNextExercise.sessionSets[0];
        }

        // Must be finished the workout
        return null;
    },

    weightForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.weight !== null) {
            return actualSet.weight;
        }

        const exercise = getters.exerciseBySet(uuid);

        return exercise.plannedWeight;
    },

    restPeriodForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.restPeriodDuration !== null) {
            return actualSet.restPeriodDuration;
        }

        const exercise = getters.exerciseBySet(uuid);

        return exercise.plannedRestPeriodDuration;
    },

    repsForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.reps !== null) {
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

        const lastExercise = state.workoutSession.sessionExercises[state.workoutSession.sessionExercises.length - 1];
        const lastSet = lastExercise.sessionSets[lastExercise.sessionSets.length - 1];

        return actualSet.uuid === lastSet.uuid;
    },

    isLastSetOfExercise: (state, getters) => (setUuid) => {
        const exercise = getters.exerciseBySet(setUuid);

        const lastExerciseOfSet = exercise.sessionSets[exercise.sessionSets.length - 1];

        return setUuid === lastExerciseOfSet.uuid;
    },

    restPeriodNotStarted: (state, getters) => (uuid) => {
        const set = getters.set(uuid);

        return set.restPeriodStartedAt === null;
    },

    isDuringRestPeriod: (state, getters) => (uuid) => {
        const set = getters.set(uuid);
        return set.restPeriodStartedAt !== null && set.restPeriodEndedAt === null;
    },

    restPeriodIsFinished: (state, getters) => (uuid) => {
        const set = getters.set(uuid);

        return set.restPeriodStartedAt !== null && set.restPeriodEndedAt !== null;
    },

    restPeriodTimeRemaining: (state, getters) => (uuid) => {
        if (!getters.isDuringRestPeriod(uuid)) {
            return null;
        }

        // In seconds.
        const expectedDuration = getters.restPeriodForCurrentSet(uuid);

        const minutesToAdd = Math.floor(expectedDuration / 60);
        const secondsToAdd =  expectedDuration - minutesToAdd * 60;

        let startTime = new Date(getters.set(uuid).restPeriodStartedAt);

        const finishTimeMinutes = minutesToAdd + startTime.getMinutes();
        const finishTimeSeconds = secondsToAdd + startTime.getSeconds();

        let finishTime = new Date(getters.set(uuid).restPeriodStartedAt);
        finishTime.setMinutes(finishTimeMinutes)
        finishTime.setSeconds(finishTimeSeconds)

        const now = Math.round((new Date(utcNow()).getTime()) / 1000);
        const finishInSeconds = Math.round((finishTime).getTime() / 1000);

        return finishInSeconds - now;
    },

    hasLoadedExercisePreviousEntries: (state) => (exerciseUuid) => {
        return typeof state.exercisesPreviousEntries[exerciseUuid] !== 'undefined';
    },

    exercisePreviousEntries: (state) => (exerciseUuid) => {
        return state.exercisesPreviousEntries[exerciseUuid] || [];
    },

    updatedAt(state) {
        return state.workoutSession.updatedAt;
    },

};

export const actions = {
    ...saveStatusActions,

    updateSetWeight({ commit, dispatch, getters }, { uuid, weight }) {
        commit('updateSet', { uuid, weight });

        // If we are in progress, update the upcoming sets as well as this set.
        if (getters.isInProgressWorkout) {
            const exercise = getters.exerciseBySet(uuid);

            exercise.sessionSets.forEach(set => {
                if (set.uuid !== uuid && set.startedAt === null) {
                    commit('updateSet', { uuid: set.uuid, weight });
                }
            });

            dispatch('saveExercise', exercise.uuid);
        } else {
            dispatch('saveSet', uuid);
        }
    },

    updateSetRestPeriodDuration({ commit, dispatch  }, { uuid, restPeriodDuration }) {
        commit('updateSet', { uuid, restPeriodDuration });

        dispatch('saveSet', uuid);
    },

    updateSetReps({ commit, dispatch  }, { uuid, reps }) {
        commit('updateSet', { uuid, reps });

        dispatch('saveSet', uuid);
    },

    updateExerciseNotes({ commit, dispatch  }, { uuid, notes }) {
        commit('updateExercise', { uuid, notes });

        dispatch('saveExercise', uuid);
    },

    startSet({ commit, dispatch, getters  }, { uuid }) {
        const startedAt = utcNow();

        commit('startSet', { uuid, startedAt });
        commit('updateSet', { uuid, updatedAt: utcNow() });

        dispatch('saveSet', uuid);
    },

    endSet({ commit, dispatch, getters  }, { uuid, endedAt }) {
        const set = getters.set(uuid);

        endedAt = endedAt || utcNow();

        if (set.restPeriodStartedAt !== null && set.restPeriodEndedAt === null) {
            const restPeriodEndedAt = utcNow();
            const restPeriodDuration = differenceInSeconds(new Date(restPeriodEndedAt), new Date(set.restPeriodStartedAt));
            commit('endRestPeriod', { uuid, restPeriodEndedAt, restPeriodDuration });
        }

        commit('endSet', { uuid, endedAt });

        dispatch('saveSet', uuid);
    },

    startRestPeriod({ commit, dispatch, getters  }, { uuid }) {
        const restPeriodStartedAt = utcNow();

        commit('updateSet', { uuid, restPeriodStartedAt, restPeriodEndedAt: null });

        dispatch('saveSet', uuid);
    },

    endRestPeriod({ commit, dispatch, getters  }, { uuid }) {
        const set = getters.set(uuid);

        const restPeriodEndedAt = utcNow();
        const restPeriodDuration = differenceInSeconds(new Date(restPeriodEndedAt), new Date(set.restPeriodStartedAt));
        commit('endRestPeriod', { uuid, restPeriodEndedAt, restPeriodDuration });

        dispatch('saveSet', uuid);
    },

    updateOpenForEditsStatus({ state, commit }, { workoutSessionUuid, value }) {
        const openForEdits = new Map(state.openForEdits);

        openForEdits.set(workoutSessionUuid, value);

        commit('reset', { openForEdits });
    },

    async archive({ state, commit, dispatch }, uuidToDelete) {
        try {
            const updatedWorkoutSessions = UuidHelper.removeFromCopy(state.myWorkoutSessions, uuidToDelete)
            const updatedInProgressWorkouts = UuidHelper.removeFromCopy(state.inProgressWorkouts, uuidToDelete)

            // Optimistically remove from the state.
            commit('reset', {
                myWorkoutSessions: updatedWorkoutSessions,
                inProgressWorkouts: updatedInProgressWorkouts,
            });

            await WorkoutSessionService.delete(uuidToDelete);
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
    saveSet: memoizeDebounceAction(async ({ commit, getters, dispatch }, uuid) => {
        try {
            dispatch('startSaving');

            commit('updateSet', {
                uuid,
                updatedAt: utcNow()
            });

            const set = getters.set(uuid);
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

            dispatch('finishSaving');
        } catch (error) {
            dispatch('finishSavingError');
            console.error(error);
        }
    }, SAVE_DEBOUNCE_WAIT),

    saveExercise: memoizeDebounceAction(async ({ commit, getters, dispatch }, uuid) => {
        try {
            dispatch('startSaving');

            commit('updateExercise', {
                uuid,
                updatedAt: utcNow()
            });

            const response = await WorkoutSessionService.saveExercise(getters.exercise(uuid));

            commit('updateWorkoutSession', {
                uuid: getters.uuid,
                updatedAt: response.data.updatedAt,
            });

            commit('updateExercise', {
                uuid,
                updatedAt: response.data.updatedAt,
                createdAt: response.data.createdAt,
            });

            dispatch('finishSaving');
        } catch (error) {
            dispatch('finishSavingError');
            console.error(error);
        }
    }, SAVE_DEBOUNCE_WAIT),

    async saveWorkout({ commit, state, dispatch }) {
        try {
            dispatch('startSaving');

            const uuid = state.workoutSession.uuid;

            commit('updateWorkoutSession', {
                uuid,
                updatedAt: utcNow()
            });

            const response = await WorkoutSessionService.save(state.workoutSession);

            commit('updateWorkoutSession', {
                uuid,
                updatedAt: response.data.updatedAt,
                createdAt: response.data.createdAt,
            });

            dispatch('finishSaving');
        } catch (error) {
            dispatch('finishSavingError');
            console.error(error);
        }
    },

    async fetch({ commit, dispatch }, uuid) {
        const response = await WorkoutSessionService.get(uuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    /**
     * @param commit
     * @param state
     * @return {Promise<*>}
     */
    async fetchNextPage({ commit, state }) {
        const nextPage = state.myMyWorkoutSessionsPagesLoaded + 1;
        const response = await WorkoutSessionService.index(nextPage);

        commit('reset', {
            myWorkoutSessions: [...state.myWorkoutSessions, ...response.data],
            myMyWorkoutSessionsPagesLoaded: nextPage,
            myMyWorkoutSessionsPagesAllLoaded: response.data.length < WorkoutSessionService.getPageSize(),
        });

        return response;
    },

    async fetchBySet({ commit, dispatch }, sessionSetUuid) {
        const response = await WorkoutSessionService.getBySet(sessionSetUuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    async fetchInProgressWorkouts({ commit }) {
        const response = await WorkoutSessionService.getInProgressWorkouts();

        if (response.data === '') {
            response.data = null;
        }

        commit('updateInProgress', response.data);

        return response;
    },

    async fetchExercisePreviousEntries({ commit, dispatch }, exerciseUuid) {
        const response = await WorkoutSessionService.getExercisePreviousEntries(exerciseUuid);

        if (response.data === '') {
            response.data = [];
        }

        commit('updateExercisePreviousEntries', { exerciseUuid, previousEntries: response.data });

        return response;
    },

    async startWorkout({ commit, dispatch, state }, { originWorkoutUuid }) {
        const originalState = defaultState();
        const response = await WorkoutSessionService.startNew(originWorkoutUuid);

        const update = {
            workoutSession: response.data,
            exercisesPreviousEntries: originalState.exercisesPreviousEntries,
            inProgressWorkouts: [...state.inProgressWorkouts, response.data],
            myWorkoutSessions: [response.data, ...state.myWorkoutSessions],
        };

        commit('reset', update);
    },

    async endWorkout({ commit, dispatch, getters }) {
        const endedAt = utcNow();

        const lastExercise = state.workoutSession.sessionExercises[state.workoutSession.sessionExercises.length - 1];
        const lastSet = lastExercise.sessionSets[lastExercise.sessionSets.length - 1];

        if (lastSet.endedAt === null) {
            dispatch('endSet', { uuid: lastSet.uuid, endedAt });
        }

        // Remove this workout from the in progress list.
        const inProgressWorkouts = getters.inProgressWorkouts.filter((inProgressWorkout) => {
            return getters.workoutSession.uuid !== inProgressWorkout.uuid;
        })

        commit('endWorkout', { endedAt });
        commit('updateInProgress', inProgressWorkouts);

        const save = await dispatch('saveWorkout');
        dispatch('fetchInProgressWorkouts');

        return save;
    },

};

const mutations = {
    ...saveStatusMutations,

    restoreDefault(state) {
        const originalState = defaultState();

        Object.keys(originalState).forEach(key => {
            state[key] = originalState[key];
        });
    },

    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });
    },

    updateWorkoutSession(state, newSetState) {
        Object.keys(newSetState).forEach(key => {
            state.workoutSession[key] = newSetState[key]
        });
    },

    updateSet(state, newSetState) {
        const set = UuidHelper.findDeep(state.workoutSession.sessionExercises, newSetState.uuid);

        Object.keys(newSetState).forEach(key => {
            set[key] = newSetState[key]
        });
    },

    updateExercise(state, newExerciseState) {
        const exercise = UuidHelper.findIn(state.workoutSession.sessionExercises, newExerciseState.uuid);

        Object.keys(newExerciseState).forEach(key => {
            exercise[key] = newExerciseState[key]
        });
    },

    updateInProgress(state, inProgressWorkouts) {
        if (state.inProgressWorkouts === null || inProgressWorkouts.length === 0) {
            state.inProgressWorkouts = inProgressWorkouts;
            return;
        }

        inProgressWorkouts.forEach(fromServer => {
            const inState = UuidHelper.findIn(state.inProgressWorkouts, fromServer.uuid)

            const fromServerUpdatedAt = new Date(fromServer.updatedAt);
            const fromStateUpdatedAt = new Date(inState.updatedAt);

            if (isAfter(fromServerUpdatedAt, fromStateUpdatedAt)) {
                Object.assign(inState, fromServer);
            }
        })
    },

    updateExercisePreviousEntries(state, { exerciseUuid, previousEntries }) {
        state.exercisesPreviousEntries[exerciseUuid] = previousEntries;
    },

    startSet(state, { uuid, startedAt }) {
        const set = UuidHelper.findDeep(state.workoutSession.sessionExercises, uuid);
        const inProgressSet = UuidHelper.findDeep(state.inProgressWorkouts, uuid);

        set.startedAt = startedAt;
        inProgressSet.startedAt = startedAt;
    },

    endSet(state, { uuid, endedAt }) {
        const set = UuidHelper.findDeep(state.workoutSession.sessionExercises, uuid);
        const inProgressSet = UuidHelper.findDeep(state.inProgressWorkouts, uuid);

        set.endedAt = endedAt;
        inProgressSet.endedAt = endedAt;
    },

    setRestPeriodTimeout(state, restPeriodTimeout) {
        state.restPeriodTimeout = restPeriodTimeout;
    },

    endRestPeriod(state, { uuid, restPeriodEndedAt, restPeriodDuration }) {
        const set = UuidHelper.findDeep(state.workoutSession.sessionExercises, uuid);
        set.restPeriodEndedAt = restPeriodEndedAt;
        set.restPeriodDuration = restPeriodDuration;

        clearTimeout(state.restPeriodTimeout);
        state.restPeriodTimeout = null;
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
    mutations
}

