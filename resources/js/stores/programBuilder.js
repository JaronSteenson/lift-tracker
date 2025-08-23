import { defineStore } from 'pinia';
import WorkoutProgramService from '../api/WorkoutProgramService';
import UuidHelper from '../UuidHelper';
import { pick } from '../util/index';
import { useAppStore } from './app';

const LOCAL_STORAGE_KEY = 'store-state--ProgramBuilder';

function defaultState() {
    return {
        justAddedModelUuid: null,
        hasMadeSignificantChangesFromNew: false,
        draggingExercise: false,
        draggingWorkout: false,
        inFocusProgram: {
            uuid: null,
            name: 'New Program',
            workoutProgramRoutines: [
                {
                    uuid: UuidHelper.assign(),
                    name: 'Workout 1',
                    normalDay: 'any',
                    position: 0,
                    routineExercises: [],
                },
            ],
            createdAt: null,
            updatedAt: null,
            isDirty: false,
        },
        delayedSavingToServer: false,
        myWorkoutPrograms: [],
        myWorkoutProgramsIsLoading: false,
        myWorkoutProgramsLoaded: false,
        // Save status fields
        lastSavedAt: null,
        saveStatus: 'unsaved',
        saveError: null,
    };
}

const programFields = [
    'uuid',
    'name',
    'workoutProgram',
    'workoutProgramRoutines',
    'createdAt',
    'updatedAt',
];

const workoutFields = [
    'uuid',
    'name',
    'normalDay',
    'position',
    'routineExercises',
];

const exerciseFields = [
    'uuid',
    'name',
    'position',
    'sets',
    'reps',
    'restPeriodInSeconds',
    'weight',
    'notes',
    'mode',
];

export const useProgramBuilderStore = defineStore('programBuilder', {
    state: () => defaultState(),

    getters: {
        getWorkout: (state) => (uuid) => {
            return {
                ...UuidHelper.findIn(
                    state.inFocusProgram.workoutProgramRoutines,
                    uuid,
                ),
                workoutProgram: state.inFocusProgram,
            };
        },

        getOrderedWorkouts: (state) => {
            return [...state.inFocusProgram.workoutProgramRoutines].sort(
                (a, b) => {
                    return a.position - b.position;
                },
            );
        },

        getOrderedExercises: (state) => (workoutUuid) => {
            const workout = UuidHelper.findIn(
                state.inFocusProgram.workoutProgramRoutines,
                workoutUuid,
            );
            return [...workout.routineExercises].sort((a, b) => {
                return a.position - b.position;
            });
        },

        getExercise: (state) => (uuid) => {
            let exercise = null;
            state.inFocusProgram.workoutProgramRoutines.some(
                function (workout) {
                    let found = UuidHelper.findIn(
                        workout.routineExercises,
                        uuid,
                    );
                    if (found) {
                        exercise = found;
                        return true;
                    }
                },
            );
            return exercise;
        },

        savePayload: (state) => {
            const cleaned = pick(state.inFocusProgram, programFields);

            // Add workoutProgram field if missing (required by server)
            if (!cleaned.workoutProgram) {
                cleaned.workoutProgram = cleaned.uuid || null;
            }

            cleaned.workoutProgramRoutines =
                state.inFocusProgram.workoutProgramRoutines.map((workout) => {
                    const cleanedWorkout = pick(workout, workoutFields);

                    // Ensure normalDay is the expected enum value
                    if (typeof cleanedWorkout.normalDay === 'boolean') {
                        cleanedWorkout.normalDay = 'any';
                    }

                    cleanedWorkout.routineExercises =
                        cleanedWorkout.routineExercises.map((exercise) =>
                            pick(exercise, exerciseFields),
                        );
                    return cleanedWorkout;
                });
            return cleaned;
        },

        fromLocalStorage: () => {
            return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        },
        forLocalStorageSave: (state) => ({
            myWorkoutPrograms: state.myWorkoutPrograms,
            myWorkoutProgramsLoaded: state.myWorkoutProgramsLoaded,
            inFocusProgram: state.inFocusProgram,
        }),
    },

    actions: {
        saveToLocalStorage() {
            const { useAppStore } = require('./app');
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify(this.forLocalStorageSave),
                );
            }
        },

        syncInFocusProgramToList() {
            // For local-only users, sync the inFocusProgram changes to myWorkoutPrograms list
            const { useAppStore } = require('./app');
            const appStore = useAppStore();
            if (appStore.localOnlyUser && this.inFocusProgram.uuid) {
                const existingIndex = this.myWorkoutPrograms.findIndex(
                    (program) => program.uuid === this.inFocusProgram.uuid,
                );
                if (existingIndex !== -1) {
                    // Update with full program data including latest routines
                    this.myWorkoutPrograms[existingIndex] = {
                        ...this.myWorkoutPrograms[existingIndex],
                        name: this.inFocusProgram.name,
                        updatedAt: this.inFocusProgram.updatedAt,
                        workoutProgramRoutines:
                            this.inFocusProgram.workoutProgramRoutines || [],
                    };
                }
            }
        },

        async fetchMyWorkoutPrograms() {
            const { useAppStore } = require('./app');
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                // For local-only users, load from localStorage if not already loaded
                if (!this.myWorkoutProgramsLoaded) {
                    const localStorageData = this.fromLocalStorage;
                    if (localStorageData) {
                        this.myWorkoutPrograms =
                            localStorageData.myWorkoutPrograms || [];
                        this.myWorkoutProgramsLoaded =
                            localStorageData.myWorkoutProgramsLoaded || false;
                    }
                }
                return;
            }
            this.myWorkoutProgramsIsLoading = true;
            try {
                const response = await WorkoutProgramService.getAll();
                this.myWorkoutPrograms = response.data;
                this.myWorkoutProgramsLoaded = true;
            } catch (error) {
                console.error('Error fetching workout programs:', error);
            } finally {
                this.myWorkoutProgramsIsLoading = false;
            }
        },

        async fetchMyWorkoutProgramsWithRoutines() {
            const { useAppStore } = require('./app');
            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, load from localStorage if not already loaded
                const localStorageData = this.fromLocalStorage;
                if (localStorageData) {
                    this.myWorkoutPrograms =
                        localStorageData.myWorkoutPrograms || [];
                    this.myWorkoutProgramsLoaded =
                        localStorageData.myWorkoutProgramsLoaded || false;

                    // Also restore the inFocusProgram if it exists
                    if (localStorageData.inFocusProgram) {
                        this.inFocusProgram = localStorageData.inFocusProgram;
                    }
                }
                return this.myWorkoutPrograms; // Return local data for local-only users
            }

            this.myWorkoutProgramsIsLoading = true;
            try {
                const response = await WorkoutProgramService.getAll();
                // Store the full program data including routines
                this.myWorkoutPrograms = response.data;
                this.myWorkoutProgramsLoaded = true;
                return response.data;
            } catch (error) {
                console.error(
                    'Error fetching workout programs with routines:',
                    error,
                );
                throw error;
            } finally {
                this.myWorkoutProgramsIsLoading = false;
            }
        },

        setInFocusProgram(program) {
            this.inFocusProgram = {
                ...defaultState().inFocusProgram,
                ...program,
            };
        },

        addWorkoutToProgram() {
            const newWorkout = {
                uuid: UuidHelper.assign(),
                name: `Workout ${this.inFocusProgram.workoutProgramRoutines.length + 1}`,
                normalDay: 'any',
                position: this.inFocusProgram.workoutProgramRoutines.length,
                routineExercises: [],
            };

            this.inFocusProgram.workoutProgramRoutines.push(newWorkout);
            this.justAddedModelUuid = newWorkout.uuid;
            this.markDirty();

            const { useAppStore } = require('./app');
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                this.syncInFocusProgramToList();
                this.saveToLocalStorage();
            }
        },

        async save() {
            if (this.saveStatus === 'saving') {
                return;
            }

            this.saveStatus = 'saving';
            this.saveError = null;

            const { useAppStore } = require('./app');
            const appStore = useAppStore();

            // For local-only users, save to localStorage instead of server
            if (appStore.localOnlyUser) {
                try {
                    const wasNewProgram = !this.inFocusProgram.uuid;

                    // Assign UUID if new program
                    if (wasNewProgram) {
                        this.inFocusProgram.uuid = UuidHelper.assign();
                        this.inFocusProgram.createdAt =
                            new Date().toISOString();
                    }

                    this.inFocusProgram.updatedAt = new Date().toISOString();
                    this.inFocusProgram.isDirty = false;

                    // Add to programs list if new
                    if (wasNewProgram) {
                        // For local-only users, store the full program data including routines
                        const fullProgram = {
                            uuid: this.inFocusProgram.uuid,
                            name: this.inFocusProgram.name,
                            createdAt: this.inFocusProgram.createdAt,
                            updatedAt: this.inFocusProgram.updatedAt,
                            workoutProgramRoutines:
                                this.inFocusProgram.workoutProgramRoutines ||
                                [],
                        };
                        this.myWorkoutPrograms.unshift(fullProgram);
                        this.myWorkoutProgramsLoaded = true;
                    } else {
                        // Update existing program in the list
                        const existingIndex = this.myWorkoutPrograms.findIndex(
                            (program) =>
                                program.uuid === this.inFocusProgram.uuid,
                        );
                        if (existingIndex !== -1) {
                            // For local-only users, update with full program data
                            this.myWorkoutPrograms[existingIndex] = {
                                ...this.myWorkoutPrograms[existingIndex],
                                name: this.inFocusProgram.name,
                                updatedAt: this.inFocusProgram.updatedAt,
                                workoutProgramRoutines:
                                    this.inFocusProgram
                                        .workoutProgramRoutines || [],
                            };
                        }
                    }

                    this.saveStatus = 'saved';
                    this.lastSavedAt = this.inFocusProgram.updatedAt;
                    this.hasMadeSignificantChangesFromNew = true;
                    this.syncInFocusProgramToList();
                    this.saveToLocalStorage();
                    return;
                } catch (error) {
                    this.saveStatus = 'error';
                    this.saveError =
                        error.message || 'Failed to save program locally';
                    throw error;
                }
            }

            try {
                const payload = this.savePayload;
                const wasNewProgram = !this.inFocusProgram.uuid;
                const response = await WorkoutProgramService.save(payload);

                // Update the program with the saved data
                this.inFocusProgram = {
                    ...this.inFocusProgram,
                    ...response.data,
                    isDirty: false,
                };

                // If this was a new program, add it to the programs list
                if (wasNewProgram && response.data.uuid) {
                    // Only add to list if the list has been fetched
                    // This prevents adding to an uninitialized/unfetched list
                    const hasLoadedPrograms = this.myWorkoutProgramsLoaded;

                    if (hasLoadedPrograms) {
                        // Create a summary version for the list
                        const programSummary = {
                            uuid: response.data.uuid,
                            name: response.data.name,
                            createdAt: response.data.createdAt,
                            updatedAt: response.data.updatedAt,
                        };
                        this.myWorkoutPrograms.unshift(programSummary); // Add to beginning of list
                    }
                } else if (response.data.uuid) {
                    // Update existing program in the list
                    const existingIndex = this.myWorkoutPrograms.findIndex(
                        (program) => program.uuid === response.data.uuid,
                    );
                    if (existingIndex !== -1) {
                        this.myWorkoutPrograms[existingIndex] = {
                            ...this.myWorkoutPrograms[existingIndex],
                            name: response.data.name,
                            updatedAt: response.data.updatedAt,
                        };
                    }
                }

                this.saveStatus = 'saved';
                this.lastSavedAt = new Date().toISOString();
                this.hasMadeSignificantChangesFromNew = true;
            } catch (error) {
                console.error('Save error details:', error.response?.data);
                this.saveStatus = 'error';
                this.saveError = error.message || 'Failed to save program';
                throw error;
            }
        },

        async saveIfDirty() {
            if (this.inFocusProgram.isDirty) {
                await this.save();
            }
        },

        markDirty() {
            this.inFocusProgram.isDirty = true;
            this.saveStatus = 'unsaved';

            // Clear existing delayed save
            if (this.delayedSavingToServer) {
                clearTimeout(this.delayedSavingToServer);
            }

            // Schedule auto-save after 2 seconds of inactivity
            this.delayedSavingToServer = setTimeout(() => {
                if (this.inFocusProgram.isDirty) {
                    this.save().catch((error) => {
                        console.error('Auto-save failed:', error);
                    });
                }
            }, 2000);
        },

        async delete() {
            if (!this.inFocusProgram.uuid) {
                return;
            }

            const { useAppStore } = require('./app');
            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, just remove from local storage
                this.myWorkoutPrograms = this.myWorkoutPrograms.filter(
                    (program) => program.uuid !== this.inFocusProgram.uuid,
                );
                this.$patch(defaultState());
                this.saveToLocalStorage();
                return;
            }

            try {
                await WorkoutProgramService.delete(this.inFocusProgram.uuid);
                this.$patch(defaultState());
            } catch (error) {
                console.error('Error deleting program:', error);
                throw error;
            }
        },

        async deleteProgram(programUuid) {
            const { useAppStore } = require('./app');
            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, just remove from local storage
                this.myWorkoutPrograms = this.myWorkoutPrograms.filter(
                    (program) => program.uuid !== programUuid,
                );

                if (this.inFocusProgram.uuid === programUuid) {
                    this.$patch(defaultState());
                }

                this.saveToLocalStorage();
                return;
            }

            try {
                await WorkoutProgramService.delete(programUuid);

                // Remove from local programs list if it exists
                this.myWorkoutPrograms = this.myWorkoutPrograms.filter(
                    (program) => program.uuid !== programUuid,
                );

                // If this was the in-focus program, reset to default state
                if (this.inFocusProgram.uuid === programUuid) {
                    this.$patch(defaultState());
                }
            } catch (error) {
                console.error('Error deleting program:', error);
                throw error;
            }
        },

        async startNew() {
            // Reset to new program state but preserve programs list if loaded
            const currentPrograms = this.myWorkoutPrograms;
            const programsLoaded = this.myWorkoutProgramsLoaded;
            this.$patch(defaultState());
            if (programsLoaded) {
                this.myWorkoutPrograms = currentPrograms;
                this.myWorkoutProgramsLoaded = true;
            }
        },

        async fetch(workoutProgramUuid) {
            const { useAppStore } = require('./app');
            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, find in local storage
                const localStorageData = this.fromLocalStorage;
                if (
                    localStorageData?.inFocusProgram?.uuid ===
                    workoutProgramUuid
                ) {
                    this.setInFocusProgram(localStorageData.inFocusProgram);
                    this.saveStatus = 'saved';
                    this.lastSavedAt =
                        localStorageData.inFocusProgram.updatedAt;
                }
                return;
            }

            try {
                const response =
                    await WorkoutProgramService.get(workoutProgramUuid);
                this.setInFocusProgram(response.data);
                this.saveStatus = 'saved';
                this.lastSavedAt = response.data.updatedAt;
            } catch (error) {
                console.error('Error fetching program:', error);
                throw error;
            }
        },

        async prepareForSessionOverview(routineUuid) {
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                const foundLocally = this.myWorkoutPrograms.find((program) =>
                    program.workoutProgramRoutines.some(
                        (routine) => routine.uuid === routineUuid,
                    ),
                );
                this.setInFocusProgram(foundLocally);
                return; // Skip fetching for local-only users
            }

            try {
                // Find the routine by UUID and load its parent program
                const response =
                    await WorkoutProgramService.getByRoutine(routineUuid);
                if (response.data) {
                    this.setInFocusProgram(response.data);
                    return response.data;
                }
            } catch (error) {
                console.error('Error preparing for session overview:', error);
                throw error;
            }
        },

        updateName(name) {
            this.inFocusProgram.name = name;
            this.markDirty();
        },

        updateWorkoutPositionFromOrder(orderedWorkouts) {
            // Update positions and assign the new order
            orderedWorkouts.forEach((workout, index) => {
                workout.position = index;
            });

            this.inFocusProgram.workoutProgramRoutines = orderedWorkouts;
            this.markDirty();
        },

        updateWorkout(workoutData) {
            const workoutIndex =
                this.inFocusProgram.workoutProgramRoutines.findIndex(
                    (workout) => workout.uuid === workoutData.uuid,
                );

            if (workoutIndex !== -1) {
                this.inFocusProgram.workoutProgramRoutines[workoutIndex] = {
                    ...this.inFocusProgram.workoutProgramRoutines[workoutIndex],
                    ...workoutData,
                };
                this.markDirty();
            }
        },

        addExerciseToWorkout({ workoutUuid }) {
            const workout = UuidHelper.findIn(
                this.inFocusProgram.workoutProgramRoutines,
                workoutUuid,
            );

            if (workout) {
                const exerciseNumber = workout.routineExercises.length + 1;
                const newExercise = {
                    uuid: UuidHelper.assign(),
                    name: `Exercise ${exerciseNumber}`,
                    position: workout.routineExercises.length,
                    sets: 3,
                    reps: 10,
                    restPeriodInSeconds: 60,
                    warmUp: 0,
                    weight: null,
                    notes: '',
                    mode: 'normal',
                };

                workout.routineExercises.push(newExercise);
                this.justAddedModelUuid = newExercise.uuid;
                this.markDirty();
            }
        },

        deleteWorkout({ workoutUuid }) {
            const workoutIndex =
                this.inFocusProgram.workoutProgramRoutines.findIndex(
                    (workout) => workout.uuid === workoutUuid,
                );

            if (workoutIndex !== -1) {
                this.inFocusProgram.workoutProgramRoutines.splice(
                    workoutIndex,
                    1,
                );

                // Update positions of remaining workouts
                this.inFocusProgram.workoutProgramRoutines.forEach(
                    (workout, index) => {
                        workout.position = index;
                    },
                );
                this.markDirty();
            }
        },

        updateExercisePositionFromOrder({ workoutUuid, newOrderedExercises }) {
            const workout = UuidHelper.findIn(
                this.inFocusProgram.workoutProgramRoutines,
                workoutUuid,
            );

            if (workout) {
                // Update positions and assign the new order
                newOrderedExercises.forEach((exercise, index) => {
                    exercise.position = index;
                });

                workout.routineExercises = newOrderedExercises;
                this.markDirty();
            }
        },

        updateExercise({ exerciseUuid, ...exerciseData }) {
            let targetExercise = null;

            // Find the exercise in any workout
            this.inFocusProgram.workoutProgramRoutines.some((workout) => {
                const exercise = UuidHelper.findIn(
                    workout.routineExercises,
                    exerciseUuid,
                );
                if (exercise) {
                    targetExercise = exercise;
                    return true;
                }
                return false;
            });

            if (targetExercise) {
                Object.assign(targetExercise, exerciseData);
                this.markDirty();
            }
        },

        deleteExercise({ exerciseUuid }) {
            this.inFocusProgram.workoutProgramRoutines.forEach((workout) => {
                const exerciseIndex = workout.routineExercises.findIndex(
                    (exercise) => exercise.uuid === exerciseUuid,
                );

                if (exerciseIndex !== -1) {
                    workout.routineExercises.splice(exerciseIndex, 1);

                    // Update positions of remaining exercises
                    workout.routineExercises.forEach((exercise, index) => {
                        exercise.position = index;
                    });
                    this.markDirty();
                }
            });
        },

        setDraggingExercise(isDragging) {
            this.draggingExercise = isDragging;
        },

        setDraggingWorkout(isDragging) {
            this.draggingWorkout = isDragging;
        },

        // Add more actions as needed - this is a basic structure
        // You'll need to migrate the full functionality from the original store
    },
});
