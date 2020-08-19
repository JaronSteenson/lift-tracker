import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'
import {differenceInSeconds, isAfter} from 'date-fns';
import {utcNow} from '../../dates';
import {
    mutations as saveStatusMutations,
    actions as saveStatusActions,
    state as saveStatusState,
    getters as savingStatusGetters,
} from './saveStatusMixin';
import {memoizeDebounceAction} from "../../util";

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
        workoutSessions: [],
        lastTimeExercises: {}, // A map of sessionExercises Keyed by the exercise uuid.
        inProgressWorkouts: null, // An array of workouts.
        restPeriodTimout: null,
    }
}

const state = defaultState();

export const getters = {
    ...savingStatusGetters,

    hasLoadedInProgressWorkouts(state, getters) {
        return getters.inProgressWorkouts !== null;
    },

    isInProgressWorkout: (state, getters) => (uuid) => {
        return UuidHelper.findIn(getters.inProgressWorkouts, uuid);
    },

    currentSetForInProgressWorkout: (state, getters) => (uuid) => {
        const workout =  UuidHelper.findIn(getters.inProgressWorkouts, uuid);

        if (!workout) {
            return null;
        }

        const setGroups = workout.sessionExercises.map(exercise => {
            return exercise.sessionSets.map(set => {
                return { exercise: exercise, ...set }
            })
        });

        const allSets = setGroups.reduce((accumulator, setGroup) => {
            accumulator.push(...setGroup);
            return accumulator;
        }, [])

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

    hasSetInSession: (state) => (uuid) => {
        if (state?.workoutSession?.sessionExercises) {
            return UuidHelper.arrayIncludes(state.workoutSession.sessionExercises, uuid)
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

    hasLoadedLastTimeExercise: (state) => (exerciseUuid) => {
        return typeof state.lastTimeExercises[exerciseUuid] !== 'undefined';
    },

    lastTimeExercise: (state) => (exerciseUuid) => {
        return state.lastTimeExercises[exerciseUuid];
    },

    updatedAt(state) {
        return state.workoutSession.updatedAt;
    },

};

const actions = {
    ...saveStatusActions,

    updateSetWeight({ commit, dispatch }, { uuid, weight }) {
        commit('updateSet', { uuid, weight });

        dispatch('saveSet', uuid);
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

    /**
     * @param commit
     * @param uuid The uuid of the workout session to be archived.
     */
    async archive({ commit }, uuid) {
        await WorkoutSessionService.delete(uuid);

        commit('removeWorkoutSession', uuid);
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

    async fetchAll({ commit }) {
        const response = await WorkoutSessionService.getAll();
        commit('reset', { workoutSessions: response.data });

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

    async fetchLastTimeExercise({ commit, dispatch }, exerciseUuid) {
        const response = await WorkoutSessionService.getLastTimeSessionExercise(exerciseUuid);

        if (response.data === '') {
            response.data = null;
        }

        commit('updateLastTimeExercise', { exerciseUuid, lastTimeExercise: response.data });

        return response;
    },

    async startWorkout({ commit, dispatch, state }, { originWorkoutUuid }) {
        commit('reset', defaultState());

        const response = await WorkoutSessionService.startNew(originWorkoutUuid);

        commit('reset', { workoutSession: response.data });
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

    updateLastTimeExercise(state, {exerciseUuid, lastTimeExercise}) {
        state.lastTimeExercises[exerciseUuid] = lastTimeExercise;
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

    removeWorkoutSession(state, uuid) {
        UuidHelper.removeFrom(state.inProgressWorkouts, uuid);
        UuidHelper.removeFrom(state.workoutSessions, uuid);

        if (state.workoutSession.uuid === uuid) {
            state.workoutSession = defaultState().workoutSession;
        }
    }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
