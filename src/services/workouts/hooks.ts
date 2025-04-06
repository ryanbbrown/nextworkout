
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorkouts, createWorkout, updateWorkout, deleteWorkout, addExerciseToWorkout } from './api';
import { Workout, WorkoutExercise } from './types';

// React Query hooks
export const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workout, workoutExercises }: { 
      workout: Omit<Workout, 'id'>, 
      workoutExercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at' | 'updated_at'>[] 
    }) => createWorkout(workout, workoutExercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });
};

export const useAddExerciseToWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, exerciseId, sets, userId }: { 
      workoutId: string, 
      exerciseId: string, 
      sets: number,
      userId?: string
    }) => addExerciseToWorkout(workoutId, exerciseId, sets, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });
};
