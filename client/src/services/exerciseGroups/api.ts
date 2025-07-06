import { fetchApi } from '../../lib/api';
import { ExerciseGroup } from './types';

interface ApiResponse<T> {
    data: T;
}

// Fetch all exercise groups
export const fetchExerciseGroups = async (): Promise<ExerciseGroup[]> => {
    const response = await fetchApi<ApiResponse<ExerciseGroup[]>>('/exercise-groups');
    return response.data;
};

// Create a new exercise group
export const postExerciseGroup = async (exerciseGroup: Omit<ExerciseGroup, 'id'>): Promise<ExerciseGroup> => {
    const response = await fetchApi<ApiResponse<ExerciseGroup>>('/exercise-groups', {
        method: 'POST',
        body: JSON.stringify(exerciseGroup),
    });
    return response.data;
};

// Update an exercise group
export const putExerciseGroup = async (exerciseGroup: ExerciseGroup): Promise<ExerciseGroup> => {
    const response = await fetchApi<ApiResponse<ExerciseGroup>>(`/exercise-groups/${exerciseGroup.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            name: exerciseGroup.name,
            color: exerciseGroup.color,
            num_exercises_to_show: exerciseGroup.num_exercises_to_show
        }),
    });
    return response.data;
};

// Delete an exercise group
export const deleteExerciseGroup = async (id: string): Promise<void> => {
    await fetchApi(`/exercise-groups/${id}`, {
        method: 'DELETE',
    });
}; 