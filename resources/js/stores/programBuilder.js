import { defineStore } from 'pinia';
import WorkoutProgramService from '../api/WorkoutProgramService';
import UuidHelper from '../UuidHelper';
import { useAppStore } from './app';
import { utcNow } from '../dates';
import {
    STATUS_SAVE_ERROR,
    STATUS_SAVE_IN_PROGRESS,
    STATUS_SAVE_OK,
} from '../components/ServerSyncInfo.vue';

const LOCAL_STORAGE_KEY = 'store-state--ProgramBuilder';

function defaultState() {
    return {
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
        },
        delayedSavingToServer: false,
        myWorkoutPrograms: [],
        myWorkoutProgramsIsLoading: false,
        serverSyncStatus: STATUS_SAVE_OK,
        serverSyncUpdatedAt: utcNow(),
    };
}

export const useProgramBuilderStore = defineStore('programBuilder', {
    state: () => defaultState(),

    getters: {
        getRoutine: (state) => (routineUuid) => {
            return {
                ...UuidHelper.findIn(
                    state.inFocusProgram.workoutProgramRoutines,
                    routineUuid,
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
            return UuidHelper.findDeep(
                state.inFocusProgram.workoutProgramRoutines,
                uuid,
            );
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
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(this.forLocalStorageSave),
            );
        },

        async fetchMyWorkoutPrograms() {
            const appStore = useAppStore();
            if (appStore.localOnlyUser) {
                return;
            }

            this.myWorkoutProgramsIsLoading = true;
            const response = await WorkoutProgramService.getAll();
            this.myWorkoutPrograms = response.data;
            this.myWorkoutProgramsIsLoading = false;
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
        },

        save() {
            return this.doSave(this._save);
        },

        async _save() {
            {
                const appStore = useAppStore();

                if (!appStore.localOnlyUser) {
                    const response = await WorkoutProgramService.save(
                        this.inFocusProgram,
                    );

                    this.inFocusProgram = {
                        ...this.inFocusProgram,
                        ...response.data,
                    };
                }
            }
        },

        async doSave(saveFn, ...args) {
            try {
                this.serverSyncStatus = STATUS_SAVE_IN_PROGRESS;

                await saveFn.call(this, ...args);

                this.serverSyncUpdatedAt = utcNow();
                this.serverSyncStatus = STATUS_SAVE_OK;
            } catch (error) {
                console.error(error);
                this.serverSyncStatus = STATUS_SAVE_ERROR;
            } finally {
                this.saveToLocalStorage();
            }
        },

        async deleteProgram(programUuid = this.inFocusProgram.uuid) {
            const appStore = useAppStore();

            if (!appStore.localOnlyUser) {
                await WorkoutProgramService.delete(programUuid);
            }

            this.myWorkoutPrograms = UuidHelper.removeFromCopy(
                this.myWorkoutPrograms,
                programUuid,
            );
            this.saveToLocalStorage();

            // If this was the in-focus program, reset to default state
            if (this.inFocusProgram.uuid === programUuid) {
                this.$patch(defaultState());
            }
        },

        async startNew() {
            this.$patch(defaultState());
        },

        async fetch(workoutProgramUuid) {
            const appStore = useAppStore();

            if (appStore.localOnlyUser) {
                // For local-only users, find in local storage
                const localStorageData = this.fromLocalStorage;
                if (
                    localStorageData?.inFocusProgram?.uuid ===
                    workoutProgramUuid
                ) {
                    this.setInFocusProgram(localStorageData.inFocusProgram);
                    this.serverSyncStatus = 'saved';
                }
                return;
            }

            try {
                const response =
                    await WorkoutProgramService.get(workoutProgramUuid);
                this.setInFocusProgram(response.data);
                this.serverSyncStatus = 'saved';
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

            // Find the routine by UUID and load its parent program
            const response =
                await WorkoutProgramService.getByRoutine(routineUuid);
            this.setInFocusProgram(response.data);
        },

        updateName(name) {
            this.inFocusProgram.name = name;
            this.save();
        },

        updateWorkoutPositionFromOrder(orderedWorkouts) {
            // Update positions and assign the new order
            orderedWorkouts.forEach((workout, index) => {
                workout.position = index;
            });

            this.inFocusProgram.workoutProgramRoutines = orderedWorkouts;
        },

        updateRoutine(workoutUuid, updates) {
            const routine = UuidHelper.findDeep(
                this.inFocusProgram.workoutProgramRoutines,
                workoutUuid,
            );

            Object.assign(routine, updates);
            this.save();
        },

        addExerciseToWorkout({ workoutUuid }) {
            const workout = UuidHelper.findIn(
                this.inFocusProgram.workoutProgramRoutines,
                workoutUuid,
            );

            const exerciseNumber = workout.routineExercises.length + 1;
            const newExercise = {
                uuid: UuidHelper.assign(),
                name: `Exercise ${exerciseNumber}`,
                position: workout.routineExercises.length,
                numberOfSets: 3,
                restPeriod: 60,
                warmUp: 60,
                weight: null,
            };

            workout.routineExercises.push(newExercise);
            this.save();
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
            }
            this.save();
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
            }
            this.save();
        },

        updateExercise(exerciseUuid, updates) {
            const exercise = UuidHelper.findDeep(
                this.inFocusProgram.workoutProgramRoutines,
                exerciseUuid,
            );
            Object.assign(exercise, updates);
            this.save();
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
                }
            });
            this.save();
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
