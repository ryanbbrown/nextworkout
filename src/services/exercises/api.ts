import { Exercise } from './types';
import {
  listExercises,
  listExercisesByGroup,
  createExercise,
  updateExercise,
  removeExercise
} from './services';

// HTTP-style API endpoints
export const fetchExercises = listExercises;
export const fetchExercisesByGroup = listExercisesByGroup;
export const postExercise = createExercise;
export const putExercise = updateExercise;
export const deleteExercise = removeExercise; 