import { fetchApi } from '../../lib/api';
import { Workout, WorkoutExercise } from './types';

interface CreateWorkoutRequest {
    workout: Omit<Workout, 'id'>;
    workoutExercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at' | 'updated_at'>[];
}

interface UpdateWorkoutRequest {
    workoutId: string;
    newDate?: Date;
    exerciseUpdates?: { id: string; sets: number }[];
    exercisesToRemove?: string[];
}

interface ApiResponse<T> {
    data: T;
}

// Fetch all workouts
export const fetchWorkouts = async (): Promise<Workout[]> => {
    const response = await fetchApi<ApiResponse<Workout[]>>('/workouts');
    return response.data;
};

// Create a new workout
export const postWorkout = async (request: CreateWorkoutRequest): Promise<Workout> => {
    const response = await fetchApi<ApiResponse<Workout>>('/workouts', {
        method: 'POST',
        body: JSON.stringify(request),
    });
    return response.data;
};

// Delete a workout
export const deleteWorkout = async (workoutId: string): Promise<void> => {
    await fetchApi(`/workouts/${workoutId}`, {
        method: 'DELETE',
    });
};

// Add an exercise to a workout
export const postWorkoutExercise = async (
    workoutId: string,
    exerciseId: string,
    sets: number,
    userId?: string
): Promise<WorkoutExercise> => {
    const response = await fetchApi<ApiResponse<WorkoutExercise>>(`/workouts/${workoutId}/exercises`, {
        method: 'POST',
        body: JSON.stringify({ exerciseId, sets, userId }),
    });
    return response.data;
};

// Update a workout
export const updateWorkout = async (request: UpdateWorkoutRequest): Promise<Workout> => {
    const response = await fetchApi<ApiResponse<Workout>>(`/workouts/${request.workoutId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            newDate: request.newDate?.toISOString(),
            exerciseUpdates: request.exerciseUpdates,
            exercisesToRemove: request.exercisesToRemove,
        }),
    });
    return response.data;
};
