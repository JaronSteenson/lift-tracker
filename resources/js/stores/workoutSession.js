import { defineStore } from 'pinia';
import WorkoutSessionService from '../api/WorkoutSessionService';
import createSessionFromBuilderWorkout from '../domain/createSessionFromBuilderWorkout';
import { utcNow } from '../dates';
import { differenceInSeconds, isToday } from 'date-fns';
import UuidHelper from '../UuidHelper';
import { useAppStore } from './app';

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

function defaultState() {
    return {
        myWorkoutSessions: [],
        myWorkoutSessionsIsLoading: false,
        allPagesLoaded: false,
        saveStatus: 'saved',
        workoutSession: null,
        currentPageIndex: 1,
        // Add other state properties as needed
    };
}

export const useWorkoutSessionStore = defineStore('workoutSession', {
    state: () => defaultState(),

    getters: {
        fromLocalStorage: () => {
            return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        },
        forLocalStorageSave: (state) => ({
            myWorkoutSessions: state.myWorkoutSessions,
            workoutSession: state.workoutSession,
            currentPageIndex: state.currentPageIndex,
            allPagesLoaded: state.allPagesLoaded,
        }),
        workoutName: (state) => {
            return state.workoutSession?.workoutProgramRoutine?.name || '';
        },
        uuid: (state) => {
            return state.workoutSession?.uuid || null;
        },
        updatedAt: (state) => {
            return state.workoutSession?.updatedAt || null;
        },
        firstSet: (state) => {
            // Get the first set from the first exercise
            const firstExercise = state.workoutSession?.sessionExercises?.[0];
            return firstExercise?.sessionSets?.[0] || null;
        },
        notSkippedSessionExercises: (state) => {
            // Return exercises that were not skipped
            return (
                state.workoutSession?.sessionExercises?.filter(
                    (exercise) => !exercise.skipped,
                ) || []
            );
        },
        mostRecent: (state) => (routineUuid) => {
            // Find the most recent workout session for a given routine
            const sessionsForRoutine = state.myWorkoutSessions.filter(
                (session) =>
                    session.workoutProgramRoutine?.uuid === routineUuid,
            );
            if (sessionsForRoutine.length === 0) return null;

            // Sort by endedAt date (most recent first)
            return sessionsForRoutine.sort(
                (a, b) =>
                    new Date(b.endedAt || b.updatedAt) -
                    new Date(a.endedAt || a.updatedAt),
            )[0];
        },

        // Session and set getters
        set: (state) => (sessionSetUuid) => {
            return UuidHelper.findDeep(state.workoutSession, sessionSetUuid);
        },

        exerciseBySet: (state) => (sessionSetUuid) => {
            // Find the exercise that contains a specific set
            let foundExercise = null;
            state.workoutSession?.sessionExercises?.forEach((exercise) => {
                exercise.sessionSets?.forEach((set) => {
                    if (set.uuid === sessionSetUuid) {
                        foundExercise = exercise;
                    }
                });
            });
            return foundExercise;
        },

        // Workout state getters
        isInProgressWorkout: (state) => (workoutSessionUuid) => {
            if (
                !state.workoutSession ||
                state.workoutSession.uuid !== workoutSessionUuid
            ) {
                return false;
            }
            return (
                state.workoutSession.startedAt && !state.workoutSession.endedAt
            );
        },

        // Set navigation getters
        previousSet: (state) => (currentSetUuid) => {
            const currentSet = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === currentSetUuid);

            if (!currentSet) return null;

            const allSets =
                state.workoutSession?.sessionExercises
                    ?.flatMap((ex) => ex.sessionSets)
                    ?.sort((a, b) => a.position - b.position) || [];

            const currentIndex = allSets.findIndex(
                (set) => set.uuid === currentSetUuid,
            );
            return currentIndex > 0 ? allSets[currentIndex - 1] : null;
        },

        nextSet: (state) => (currentSetUuid) => {
            const allSets =
                state.workoutSession?.sessionExercises
                    ?.flatMap((ex) => ex.sessionSets)
                    ?.sort((a, b) => a.position - b.position) || [];

            const currentIndex = allSets.findIndex(
                (set) => set.uuid === currentSetUuid,
            );
            return currentIndex >= 0 && currentIndex < allSets.length - 1
                ? allSets[currentIndex + 1]
                : null;
        },

        // Current set getter for in-progress workouts
        currentSetForInProgressWorkout: (state) => (workoutSessionUuid) => {
            if (
                !state.workoutSession ||
                state.workoutSession.uuid !== workoutSessionUuid
            ) {
                return null;
            }

            if (state.workoutSession.endedAt) {
                return null;
            }

            // Find the first incomplete set (one without endedAt)
            let currentSet = null;
            state.workoutSession.sessionExercises?.some((exercise) => {
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
                state.workoutSession.sessionExercises?.some((exercise) => {
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
        },

        // Check if the current session contains a specific set
        setIsInFocusedSession: (state) => (sessionSetUuid) => {
            return UuidHelper.findDeep(state?.workoutSession, sessionSetUuid);
        },

        // Set position getters
        isFirstSetOfWorkout: (state) => (sessionSetUuid) => {
            const allSets =
                state.workoutSession.sessionExercises
                    ?.flatMap((ex) => ex.sessionSets)
                    ?.sort((a, b) => a.position - b.position) || [];

            return allSets[0]?.uuid === sessionSetUuid;
        },

        isLastSetOfWorkout: (state) => (sessionSetUuid) => {
            if (!state.workoutSession) return false;

            const allSets =
                state.workoutSession.sessionExercises
                    ?.flatMap((ex) => ex.sessionSets)
                    ?.sort((a, b) => a.position - b.position) || [];

            return allSets[allSets.length - 1]?.uuid === sessionSetUuid;
        },

        isFirstSetOfExercise: (state) => (sessionSetUuid) => {
            if (!state.workoutSession) return false;

            let exercise = null;
            state.workoutSession.sessionExercises?.some((ex) => {
                if (
                    ex.sessionSets?.some((set) => set.uuid === sessionSetUuid)
                ) {
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
        },

        isLastSetOfExercise: (state) => (sessionSetUuid) => {
            if (!state.workoutSession) return false;

            let exercise = null;
            state.workoutSession.sessionExercises?.some((ex) => {
                if (
                    ex.sessionSets?.some((set) => set.uuid === sessionSetUuid)
                ) {
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
        },

        // Exercise navigation getters
        previousExerciseLastSet: (state) => (currentExerciseUuid) => {
            if (!state.workoutSession) return null;

            const exercises = state.workoutSession.sessionExercises || [];
            const currentExerciseIndex = exercises.findIndex(
                (ex) => ex.uuid === currentExerciseUuid,
            );

            if (currentExerciseIndex <= 0) return null;

            const previousExercise = exercises[currentExerciseIndex - 1];
            const lastSet =
                previousExercise.sessionSets?.[
                    previousExercise.sessionSets.length - 1
                ];

            return lastSet || null;
        },

        nextExerciseFirstSet: (state) => (currentExerciseUuid) => {
            if (!state.workoutSession) return null;

            const exercises = state.workoutSession.sessionExercises || [];
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
        },

        // Exercise history getter
        hasLoadedExerciseHistory: () => () => false, // Placeholder - return false for now
        exerciseHistory: () => () => [], // Placeholder - return empty array for now

        // Weight getters
        weightForCurrentSet: (state) => (sessionSetUuid) => {
            const set = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === sessionSetUuid);
            return set?.weight || null;
        },

        repsForCurrentSet: (state) => (sessionSetUuid) => {
            const set = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === sessionSetUuid);
            return set?.reps || null;
        },

        // Timer value getters
        restPeriodForCurrentSet: (state) => (sessionSetUuid) => {
            const set = UuidHelper.findDeep(
                state.workoutSession,
                sessionSetUuid,
            );

            return set?.restPeriodDuration || 0;
        },

        warmUpForCurrentExercise: (state) => (exerciseUuid) => {
            const exercise = UuidHelper.findDeep(
                state.workoutSession,
                exerciseUuid,
            );

            return exercise?.warmUpDuration || 0;
        },

        // Timing getters
        isDuringWarmUp: (state) => (exerciseUuid) => {
            const exercise = state.workoutSession?.sessionExercises?.find(
                (ex) => ex.uuid === exerciseUuid,
            );
            if (!exercise) return false;
            return exercise.warmUpStartedAt && !exercise.warmUpEndedAt;
        },

        isDuringRestPeriod: (state) => (sessionSetUuid) => {
            const set = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === sessionSetUuid);
            if (!set) return false;
            return set.restPeriodStartedAt && !set.restPeriodEndedAt;
        },

        warmUpStarted: (state) => (exerciseUuid) => {
            const exercise = state.workoutSession?.sessionExercises?.find(
                (ex) => ex.uuid === exerciseUuid,
            );
            return !!exercise?.warmUpStartedAt;
        },

        warmUpEnded: (state) => (exerciseUuid) => {
            const exercise = state.workoutSession?.sessionExercises?.find(
                (ex) => ex.uuid === exerciseUuid,
            );
            return !!exercise?.warmUpEndedAt;
        },

        restPeriodStarted: (state) => (sessionSetUuid) => {
            const set = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === sessionSetUuid);
            return !!set?.restPeriodStartedAt;
        },

        restPeriodIsFinished: (state) => (sessionSetUuid) => {
            const set = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === sessionSetUuid);
            return !!set?.restPeriodEndedAt;
        },

        warmUpTimeRemaining: (state) => (exerciseUuid) => {
            const exercise = state.workoutSession?.sessionExercises?.find(
                (ex) => ex.uuid === exerciseUuid,
            );
            if (!exercise?.warmUpStartedAt || exercise.warmUpEndedAt) {
                return null;
            }

            const expectedDuration = exercise.warmUpDuration || 0;
            const startTime = new Date(exercise.warmUpStartedAt);
            return getSecondsRemaining({ expectedDuration, startTime });
        },

        restPeriodTimeRemaining: (state) => (sessionSetUuid) => {
            const set = state.workoutSession?.sessionExercises
                ?.flatMap((ex) => ex.sessionSets)
                ?.find((set) => set.uuid === sessionSetUuid);

            if (!set?.restPeriodStartedAt || set.restPeriodEndedAt) {
                return null;
            }

            const expectedDuration = set.restPeriodDuration || 0;
            const startTime = new Date(set.restPeriodStartedAt);
            return getSecondsRemaining({ expectedDuration, startTime });
        },
    },

    actions: {
        saveToLocalStorage() {
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(this.forLocalStorageSave),
            );
        },

        async fetchNextPage() {
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                return; // Skip fetching for local-only users
            }
            if (this.allPagesLoaded || this.myWorkoutSessionsIsLoading) {
                return;
            }

            this.myWorkoutSessionsIsLoading = true;
            try {
                const response = await WorkoutSessionService.index({
                    pageIndex: this.currentPageIndex,
                    pageSize: WorkoutSessionService.getPageSize(),
                });

                if (response.data && response.data.length > 0) {
                    // Append new sessions to existing ones for pagination
                    this.myWorkoutSessions = [
                        ...this.myWorkoutSessions,
                        ...response.data,
                    ];
                    this.currentPageIndex += 1;

                    // Check if we've loaded all pages (adjust based on your API response structure)
                    if (
                        response.data.length <
                        WorkoutSessionService.getPageSize()
                    ) {
                        this.allPagesLoaded = true;
                    }
                } else {
                    this.allPagesLoaded = true;
                }
            } catch (error) {
                console.error('Error fetching workout sessions:', error);
            } finally {
                this.myWorkoutSessionsIsLoading = false;
            }
        },

        async fetchWorkoutSession(workoutSessionUuid) {
            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, find in local storage
                const localSession = this.myWorkoutSessions.find(
                    (session) => session.uuid === workoutSessionUuid,
                );
                if (localSession) {
                    this.workoutSession = localSession;
                    this.myWorkoutSessionsIsLoading = false;
                    return localSession;
                }
                return null;
            }

            try {
                this.myWorkoutSessionsIsLoading = true;
                const response =
                    await WorkoutSessionService.get(workoutSessionUuid);
                this.workoutSession = response.data;
                return response.data;
            } catch (error) {
                console.error('Error fetching workout session:', error);
                throw error;
            } finally {
                this.myWorkoutSessionsIsLoading = false;
            }
        },

        async fetchBySet(sessionSetUuid) {
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                // For local-only users, find in local storage
                const localSession = this.myWorkoutSessions.find(
                    (session) =>
                        session.uuid ===
                        Boolean(UuidHelper.findDeep(session, sessionSetUuid)),
                );
                if (localSession) {
                    this.workoutSession = localSession;
                    this.myWorkoutSessionsIsLoading = false;
                    return localSession;
                }
                return null;
            }

            try {
                this.myWorkoutSessionsIsLoading = true;
                const response =
                    await WorkoutSessionService.getBySet(sessionSetUuid);
                this.workoutSession = response.data;
                return response.data;
            } catch (error) {
                console.error('Error fetching workout session by set:', error);
                throw error;
            } finally {
                this.myWorkoutSessionsIsLoading = false;
            }
        },

        workoutSessionIsLoaded(workoutSessionUuid) {
            console.log('loaded already?', this.workoutSession.uuid);
            return (
                this.workoutSession &&
                this.workoutSession.uuid === workoutSessionUuid
            );
        },

        async delete(workoutSessionUuid) {
            this.myWorkoutSessions = this.myWorkoutSessions.filter(
                (session) => session.uuid !== workoutSessionUuid,
            );
            this.saveToLocalStorage();

            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                return; // Skip fetching for local-only users
            }

            try {
                await WorkoutSessionService.delete(workoutSessionUuid);
            } catch (error) {
                console.error('Error deleting workout session:', error);
                throw error;
            }
        },

        async saveCheckIn(checkInData) {
            const appStore = useAppStore();

            try {
                this.saveStatus = 'saving';

                if (appStore.localOnlyUser) {
                    this.workoutSession.updatedAt = utcNow();
                    this.workoutSession.createdAt =
                        this.workoutSession.createdAt || utcNow();
                } else {
                    const savePayload = {
                        ...this.workoutSession,
                        ...checkInData,
                    };
                    const response =
                        await WorkoutSessionService.save(savePayload);
                    this.workoutSession = response.data;
                }

                // Update the home page feed
                this.myWorkoutSessions = UuidHelper.replaceInCopy(
                    this.myWorkoutSessions,
                    this.workoutSession,
                    true,
                );

                this.saveToLocalStorage();

                this.saveStatus = 'saved';
            } catch (error) {
                this.saveStatus = 'error';
                throw error;
            }
        },

        async startWorkout({ originWorkout }) {
            const appStore = useAppStore();
            try {
                const existingCheckIn = this.myWorkoutSessions.find(
                    (session) =>
                        isToday(session.createdAt) && !session.startedAt,
                );

                // Create a new workout session from the routine using the helper function
                const sessionData = createSessionFromBuilderWorkout({
                    existingCheckIn,
                    originWorkout,
                });

                // Save the session using the existing save method
                if (appStore.localOnlyUser) {
                    this.workoutSession.updatedAt = utcNow();
                    this.workoutSession.createdAt =
                        this.workoutSession.createdAt || utcNow();
                } else {
                    const response =
                        await WorkoutSessionService.save(sessionData);
                    this.workoutSession = response.data;
                }

                // Update the home page feed
                this.myWorkoutSessions = UuidHelper.replaceInCopy(
                    this.myWorkoutSessions,
                    this.workoutSession,
                    true,
                );

                this.saveToLocalStorage();
                return this.workoutSession;
            } catch (error) {
                console.error('Error starting workout:', error);
                throw error;
            }
        },

        async fetchExerciseHistory() {
            // Placeholder - implement exercise history fetching if needed
            return Promise.resolve();
        },

        async updateSetWeight({ uuid, weight }) {
            // Find and update the set in the current workout session
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((set) => {
                        if (set.uuid === uuid) {
                            set.weight = weight;
                        }
                    });
                });
                // Save the set to the server or localStorage
                await this.saveSet(uuid);

                const appStore = useAppStore();
                if (appStore.localOnlyUser) {
                    this.saveToLocalStorage();
                }
            }
        },

        async updateSetReps({ uuid, reps }) {
            // Find and update the set in the current workout session
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((set) => {
                        if (set.uuid === uuid) {
                            set.reps = reps;
                        }
                    });
                });
                // Save the set to the server
                await this.saveSet(uuid);
            }
        },

        // Exercise and set management actions
        async updateExerciseWarmUpDuration({ uuid, warmUpDuration }) {
            // Find and update the exercise warm-up duration
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    if (exercise.uuid === uuid) {
                        exercise.warmUpDuration = warmUpDuration;
                    }
                });
                // Save the exercise to the server
                await this.saveExercise(uuid);
            }
        },

        async updateSetRestPeriodDuration({ uuid, restPeriodDuration }) {
            // Find and update the set rest period duration
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((set) => {
                        if (set.uuid === uuid) {
                            set.restPeriodDuration = restPeriodDuration;
                        }
                    });
                });
                // Save the set to the server
                await this.saveSet(uuid);
            }
        },

        async updateExerciseNotes({ uuid, notes }) {
            // Find and update the exercise notes in the current workout session
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    if (exercise.uuid === uuid) {
                        exercise.notes = notes;
                    }
                });
                // Save the exercise to the server
                await this.saveExercise(uuid);
            }
        },

        async endWorkout() {
            const endedAt = utcNow();

            // Find the last exercise and last set
            const lastExercise =
                this.workoutSession.sessionExercises[
                    this.workoutSession.sessionExercises.length - 1
                ];
            const lastSet =
                lastExercise.sessionSets[lastExercise.sessionSets.length - 1];

            // End the last set if it hasn't been ended already
            if (!lastSet.endedAt) {
                lastSet.endedAt = endedAt;
                await this.saveSet(lastSet.uuid);
            }

            // End the workout
            this.workoutSession.endedAt = endedAt;

            // Save the workout to the server
            await this.saveWorkout();
        },

        async resetWarmUp({ uuid }) {
            // Find and reset the exercise warm-up timers
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    if (exercise.uuid === uuid) {
                        exercise.warmUpStartedAt = null;
                        exercise.warmUpEndedAt = null;
                        exercise.warmUpDuration = null;
                    }
                });
                // Save the exercise to the server
                await this.saveExercise(uuid);
            }
        },

        async resetRestPeriod({ uuid }) {
            // Find and reset the set rest period timers
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((set) => {
                        if (set.uuid === uuid) {
                            set.restPeriodStartedAt = null;
                            set.restPeriodEndedAt = null;
                            set.restPeriodDuration = null;
                        }
                    });
                });
                // Save the set to the server
                await this.saveSet(uuid);
            }
        },

        async endSet({ uuid }) {
            // Find and end the set in the current workout session

            if (this.workoutSession) {
                const endedAt = utcNow();
                const set = UuidHelper.findDeep(this.workoutSession, uuid);
                set.endedAt = endedAt;

                // Save the set to the server
                await this.saveSet(uuid);
            }
        },

        async startSet({ uuid }) {
            // Find and start the set in the current workout session
            if (this.workoutSession) {
                const startedAt = utcNow();
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((set) => {
                        if (set.uuid === uuid) {
                            set.startedAt = startedAt;
                        }
                    });
                });

                // Save the set to the server
                await this.saveSet(uuid);
            }
        },

        async saveWorkout() {
            const appStore = useAppStore();
            this.saveStatus = 'saving';

            if (appStore.localOnlyUser) {
                this.workoutSession.updatedAt = utcNow();
                this.workoutSession.createdAt =
                    this.workoutSession.createdAt || utcNow();
            } else {
                const response = await WorkoutSessionService.save(
                    this.workoutSession,
                );
                this.workoutSession = response.data;
            }

            // Update the home page feed
            this.myWorkoutSessions = UuidHelper.replaceInCopy(
                this.myWorkoutSessions,
                this.workoutSession,
                true,
            );

            this.saveToLocalStorage();
            this.saveStatus = 'saved';
        },

        async skipExercise({ uuid }) {
            // Find and skip the exercise in the current workout session
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    if (exercise.uuid === uuid) {
                        exercise.skipped = true;
                    }
                });
                // Save the exercise to the server
                await this.saveExercise(uuid);
            }
        },

        async updateExerciseSkipped({ uuid, skipped }) {
            // Find and update the exercise skipped status
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    if (exercise.uuid === uuid) {
                        exercise.skipped = skipped;
                    }
                });
                // Save the exercise to the server
                await this.saveExercise(uuid);
            }
        },

        async startRestPeriod({ uuid }) {
            const restPeriodStartedAt = utcNow();

            // Find and update the set in local state
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((set) => {
                        if (set.uuid === uuid) {
                            set.restPeriodStartedAt = restPeriodStartedAt;
                            set.restPeriodEndedAt = null;
                        }
                    });
                });
            }

            // Save to server
            await this.saveSet(uuid);
        },

        async startWarmUp({ uuid }) {
            const warmUpStartedAt = utcNow();

            // Update the exercise in local state
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    if (exercise.uuid === uuid) {
                        exercise.warmUpStartedAt = warmUpStartedAt;
                        exercise.warmUpEndedAt = null;
                    }
                });
            }

            // Save to server
            await this.saveExercise(uuid);
        },

        async endRestPeriod({ uuid }) {
            // Find the set
            let set = null;
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((exercise) => {
                    exercise.sessionSets?.forEach((s) => {
                        if (s.uuid === uuid) {
                            set = s;
                        }
                    });
                });
            }

            if (!set) return;

            const restPeriodEndedAt = utcNow();
            const restPeriodDuration = differenceInSeconds(
                new Date(restPeriodEndedAt),
                new Date(set.restPeriodStartedAt),
            );

            // Update the set in local state
            set.restPeriodEndedAt = restPeriodEndedAt;
            set.restPeriodDuration = restPeriodDuration;

            // Save to server
            await this.saveSet(uuid);
        },

        async endWarmUp({ uuid }) {
            // Find the exercise
            let exercise = null;
            if (this.workoutSession) {
                this.workoutSession.sessionExercises?.forEach((ex) => {
                    if (ex.uuid === uuid) {
                        exercise = ex;
                    }
                });
            }

            if (!exercise) return;

            const warmUpEndedAt = utcNow();
            const warmUpDuration = differenceInSeconds(
                new Date(warmUpEndedAt),
                new Date(exercise.warmUpStartedAt),
            );

            // Update the exercise in local state
            exercise.warmUpEndedAt = warmUpEndedAt;
            exercise.warmUpDuration = warmUpDuration;

            // Save to server
            await this.saveExercise(uuid);
        },

        async saveExercise(exerciseUuid) {
            // Find the exercise to save
            const exercise = this.workoutSession.sessionExercises?.find(
                (ex) => ex.uuid === exerciseUuid,
            );
            if (!exercise) return;

            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, just save to localStorage
                this.saveToLocalStorage();
                return;
            }

            try {
                if (appStore.localOnlyUser) {
                    exercise.updatedAt = utcNow();
                } else {
                    await WorkoutSessionService.saveExercise(exercise);
                }
            } catch (error) {
                console.error('Error saving exercise:', error);
                throw error;
            }

            this.saveToLocalStorage();
        },

        async saveSet(setUuid) {
            const appStore = useAppStore();

            let set = UuidHelper.findDeep(this.workoutSession, setUuid);

            try {
                if (appStore.localOnlyUser) {
                    set.updatedAt = utcNow();
                } else {
                    await WorkoutSessionService.saveSet(set);
                }
            } catch (error) {
                console.error('Error saving set:', error);

                throw error;
            }

            this.saveToLocalStorage();
        },

        // Add more actions as needed - this is a basic structure
        // You'll need to migrate the full functionality from the original store
    },
});
