import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'
import {debounce} from "lodash";
import { differenceInSeconds, isBefore } from 'date-fns'

const SAVE_DEBOUNCE_WAIT = 1000;

function defaultState() {
    return {
        workoutSession: {
            uuid: null,
            name: '',
            startedAt: null,
            endedAt: null,
            notes: null,
            sessionExercises: null,
        },
        lastTimeExercises: {}, // Keyed by the exercise uuid.
        restPeriodTimout: null,
    }
}

function utcNow() {
    const date = new Date();

    let paddedMonth = date.getUTCMonth() + 1;
    if (paddedMonth < 10) {
        paddedMonth = `0${paddedMonth}`;
    }

    let paddedDay = date.getUTCDay();
    if (paddedDay < 10) {
        paddedDay = `0${paddedDay}`;
    }

    let paddedHour = date.getUTCHours();
    if (paddedHour < 10) {
        paddedHour = `0${paddedHour}`;
    }

    let paddedMinutes = date.getUTCMinutes();
    if (paddedMinutes < 10) {
        paddedMinutes = `0${paddedMinutes}`;
    }

    let paddedSeconds = date.getUTCSeconds();
    if (paddedSeconds < 10) {
        paddedSeconds = `0${paddedSeconds}`;
    }

    const utcDate = `${date.getUTCFullYear()}-${paddedMonth}-${paddedDay}`;
    const utcTime = `${paddedHour}:${paddedMinutes}:${paddedSeconds}`;


    return `${utcDate}T${utcTime}+00:00`;
}

const state = defaultState();

const getters = {

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

    isLastSetOfWorkout: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        const lastExercise = state.workoutSession.sessionExercises[state.workoutSession.sessionExercises.length - 1];

        const lastSet = lastExercise.sessionSets[lastExercise.sessionSets.length - 1];

        return actualSet.uuid === lastSet.uuid;
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

};

const actions = {

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

    startRestPeriod({ commit, dispatch, getters  }, { uuid }) {
        const restPeriodStartedAt = utcNow();

        commit('updateSet', { uuid, restPeriodStartedAt, restPeriodEndedAt: null });

        dispatch('startRestPeriodTimeout', { uuid });
        dispatch('saveSet', uuid);
    },

    startRestPeriodTimeout({ commit, dispatch, getters  }, { uuid }) {
        const timeRemaining = getters.restPeriodTimeRemaining(uuid);

        const restPeriodTimeout = setTimeout(() => {
            dispatch('endRestPeriod', { uuid });
            dispatch('saveSet', uuid);
        }, timeRemaining * 1000)

        commit('setRestPeriodTimeout', restPeriodTimeout);
    },

    endRestPeriod({ commit, dispatch, getters  }, { uuid }) {
        const set = getters.set(uuid);

        const restPeriodEndedAt = utcNow();
        const restPeriodDuration = differenceInSeconds(new Date(restPeriodEndedAt), new Date(set.restPeriodStartedAt));

        commit('endRestPeriod', { uuid, restPeriodEndedAt, restPeriodDuration });
        dispatch('saveSet', uuid);
    },

    saveSet: debounce(async ({ commit, getters }, uuid) => {
        try {
            commit('updateSet', { updatedAt: utcNow() });
            const response = await WorkoutSessionService.saveSet(getters.set(uuid));

            const localUpdatedAt = new Date(getters.set(uuid).updatedAt);
            const serverUpdatedAt = new Date(response.data.updatedAt);

            if (!isBefore(localUpdatedAt, serverUpdatedAt)) {
                commit('updateSet', response.data);
            }

        } catch (error) {
            console.error(error);
        }
    }, SAVE_DEBOUNCE_WAIT),

    saveExercise: debounce(async ({ commit, getters }, uuid) => {
        try {
            const response = await WorkoutSessionService.saveExercise(getters.exercise(uuid));
            commit('updateExercise', response.data);
        } catch (error) {
            console.error(error);
        }
    }, SAVE_DEBOUNCE_WAIT),

    async saveWorkout({ commit, state }) {
        debugger;
        try {
            const response = await WorkoutSessionService.save(state.workoutSession);
            commit('updateWorkout', { workout: state.workoutSession, newState: response  });
        } catch (error) {
            console.error(error);
        }
    },

    async fetch({ commit, dispatch }, uuid) {
        const response = await WorkoutSessionService.get(uuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    async fetchBySet({ commit, dispatch }, sessionSetUuid) {
        const response = await WorkoutSessionService.getBySet(sessionSetUuid);
        commit('reset', { workoutSession: response.data });

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

    async startWorkout({ commit, dispatch }, { originWorkoutUuid }) {
        commit('reset', defaultState());

        const response = await WorkoutSessionService.startNew(originWorkoutUuid);
        commit('reset', { workoutSession: response.data });
    },

    endWorkout({ commit, dispatch }) {
        const endedAt = utcNow();

        commit('endWorkout', { endedAt });
        return dispatch('saveWorkout');
    },

};

const mutations = {

    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
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

    updateLastTimeExercise(state, {exerciseUuid, lastTimeExercise}) {
        state.lastTimeExercises[exerciseUuid] = lastTimeExercise;
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
