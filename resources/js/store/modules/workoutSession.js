import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'
import {debounce} from "lodash";
import { differenceInSeconds } from 'date-fns'

const SAVE_DEBOUNCE_WAIT = 1000;

function defaultState() {
    return {
        workoutSession: {
            uuid: null,
            name: '',
            sessionExercises: null,
        },
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

    uuid(state) {
        return state.workoutSession.uuid;
    },

    workoutName(state) {
        return state.workoutSession.name;
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

    isDuringRestPeriod: (state, getters) => (uuid) => {
        const set = getters.set(uuid);

        return set.restPeriodStartedAt !== null && set.restPeriodEndedAt === null;
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

        const restPeriodInSeconds = getters.restPeriodForCurrentSet(uuid);
        const restPeriodTimeout = setTimeout(() => {
            commit('endRestPeriod', uuid);
            dispatch('saveSet', uuid);
        }, restPeriodInSeconds * 1000)

        commit('setRestPeriodTimeout', restPeriodTimeout);

        dispatch('saveSet', uuid);
    },

    endRestPeriod({ commit, dispatch  }, { uuid }) {
        commit('endRestPeriod', uuid);
        dispatch('saveSet', uuid);
    },

    saveSet: debounce(async ({ commit, getters }, uuid) => {
        try {
            const response = await WorkoutSessionService.saveSet(getters.set(uuid));

            commit('updateSet', response.data);
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

    async startWorkout({ commit, dispatch }, { originWorkoutUuid }) {
        const response = await WorkoutSessionService.startNew(originWorkoutUuid);
        commit('reset', { workoutSession: response.data });
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

    setRestPeriodTimeout(state, restPeriodTimeout) {
        state.restPeriodTimeout = restPeriodTimeout;
    },

    endRestPeriod(state, uuid) {
        const set = UuidHelper.findDeep(state.workoutSession.sessionExercises, uuid);

        set.restPeriodEndedAt = utcNow();
        set.restPeriodDuration = differenceInSeconds(new Date(set.restPeriodEndedAt), new Date(set.restPeriodStartedAt));

        clearTimeout(state.restPeriodTimeout);
        state.restPeriodTimout = null;
    },

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
