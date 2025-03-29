
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from './exercises';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  details: string;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  workout_exercises?: WorkoutExercise[];
}

// Fetch all workouts for the current user
export const fetchWorkouts = async () => {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
  
  return data as Workout[];
};

// Create a new workout with exercises
export const createWorkout = async (workout: Omit<Workout, 'id'>, workoutExercises: Omit<WorkoutExercise, 'id' | 'workout_id'>[]) => {
  // Start a transaction
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single();
  
  if (workoutError) {
    console.error('Error creating workout:', workoutError);
    throw workoutError;
  }
  
  const workoutId = workoutData.id;
  
  // Now add the workout exercises
  if (workoutExercises.length > 0) {
    const exercisesWithWorkoutId = workoutExercises.map(exercise => ({
      ...exercise,
      workout_id: workoutId
    }));
    
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(exercisesWithWorkoutId);
    
    if (exercisesError) {
      console.error('Error adding workout exercises:', exercisesError);
      throw exercisesError;
    }
    
    // Update the last_performed timestamp for each exercise
    for (const exercise of workoutExercises) {
      await supabase
        .from('exercises')
        .update({ last_performed: new Date().toISOString() })
        .eq('id', exercise.exercise_id);
    }
  }
  
  return workoutData as Workout;
};

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
      workoutExercises: Omit<WorkoutExercise, 'id' | 'workout_id'>[] 
    }) => createWorkout(workout, workoutExercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });
};
