import { fetchApi } from '../../lib/api';
import { Exercise } from './types';

interface ApiResponse<T> {
    data: T;
}

// Fetch all exercises
export const fetchExercises = async (): Promise<Exercise[]> => {
    const response = await fetchApi<ApiResponse<Exercise[]>>('/exercises');
    return response.data;
};

// Fetch exercises by group
export const fetchExercisesByGroup = async (groupId: string): Promise<Exercise[]> => {
    const response = await fetchApi<ApiResponse<Exercise[]>>(`/exercises/group/${groupId}`);
    return response.data;
};

// Create a new exercise
export const postExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const response = await fetchApi<ApiResponse<Exercise>>('/exercises', {
        method: 'POST',
        body: JSON.stringify(exercise),
    });
    return response.data;
};

// Update an exercise
export const putExercise = async (exercise: Exercise): Promise<Exercise> => {
    const response = await fetchApi<ApiResponse<Exercise>>(`/exercises/${exercise.id}`, {
        method: 'PATCH',
        body: JSON.stringify(exercise),
    });
    return response.data;
};

// Delete an exercise
export const deleteExercise = async (id: string): Promise<void> => {
    await fetchApi(`/exercises/${id}`, {
        method: 'DELETE',
    });
}; 