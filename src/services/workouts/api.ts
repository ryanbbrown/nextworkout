import { Workout, WorkoutExercise } from './types';
import {
  listWorkouts,
  createWorkout,
  removeWorkout,
  addExerciseToWorkout,
  updateWorkout as updateWorkoutService
} from './services';

// HTTP-style API endpoints
export const fetchWorkouts = listWorkouts;

export const postWorkout = createWorkout;

export const deleteWorkout = removeWorkout;

export const postWorkoutExercise = addExerciseToWorkout;

export const updateWorkout = updateWorkoutService;
