import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorkouts, createWorkout, updateWorkout, deleteWorkout, addExerciseToWorkout } from './api';
import { Workout, WorkoutExercise } from './types';
import { queryKeys } from '../queryKeys';

// React Query hooks
export const useWorkouts = () => {
  return useQuery({
    queryKey: queryKeys.workouts.list(),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all });
    }
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWorkout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.list() });
    }
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: (workoutId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(workoutId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.list() });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(data.workout_id) });
    }
  });
};
