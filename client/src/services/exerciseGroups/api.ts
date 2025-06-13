import { ExerciseGroup } from './types';
import {
    listExerciseGroups,
    createExerciseGroup,
    updateExerciseGroup,
    removeExerciseGroup
} from './services';

// HTTP-style API endpoints
export const fetchExerciseGroups = listExerciseGroups;
export const postExerciseGroup = createExerciseGroup;
export const putExerciseGroup = updateExerciseGroup;
export const deleteExerciseGroup = removeExerciseGroup; 