
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from './exercises';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  notes: string | null;
  workout_date: string; // New field for the workout date
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
    .order('workout_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
  
  return data as Workout[];
};

// Create a new workout with exercises
export const createWorkout = async (workout: Omit<Workout, 'id'>, workoutExercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at' | 'updated_at'>[]) => {
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

// Update a workout's date or exercise sets
export const updateWorkout = async ({
  workoutId,
  newDate,
  exerciseUpdates
}: {
  workoutId: string,
  newDate?: Date,
  exerciseUpdates?: { id: string, sets: number }[]
}) => {
  // Start transaction for updates
  const updates = [];

  // Update workout date if provided
  if (newDate) {
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({ 
        workout_date: newDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId);
    
    if (workoutError) {
      console.error('Error updating workout date:', workoutError);
      throw workoutError;
    }
  }
  
  // Update workout exercises if provided
  if (exerciseUpdates && exerciseUpdates.length > 0) {
    for (const update of exerciseUpdates) {
      const { error: exerciseError } = await supabase
        .from('workout_exercises')
        .update({ 
          sets: update.sets,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);
      
      if (exerciseError) {
        console.error('Error updating workout exercise:', exerciseError);
        throw exerciseError;
      }
    }
  }
  
  // Fetch the updated workout
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises(
        *,
        exercise:exercises(*)
      )
    `)
    .eq('id', workoutId)
    .single();
  
  if (error) {
    console.error('Error fetching updated workout:', error);
    throw error;
  }
  
  return data as Workout;
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
