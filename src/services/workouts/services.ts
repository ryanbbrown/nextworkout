import { supabase } from '@/lib/supabase';
import { Workout, WorkoutExercise } from './types';

// List all workouts for the current user
export const listWorkouts = async () => {
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
    console.error('Error listing workouts:', error);
    throw error;
  }
  
  return data as Workout[];
};

// Create a new workout with exercises
export const createWorkout = async (
    workout: Omit<Workout, 'id'>,
    workoutExercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at' | 'updated_at'>[]
) => {
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
  }
  
  return workoutData as Workout;
};

// Remove a workout and its exercises
export const removeWorkout = async (workoutId: string) => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);
  
  if (error) {
    console.error('Error removing workout:', error);
    throw error;
  }
  
  return workoutId;
};

// Add an exercise to an existing workout
export const addExerciseToWorkout = async (workoutId: string, exerciseId: string, sets: number, userId?: string) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      sets: sets,
      user_id: userId,
    })
    .select('*, exercise:exercises(*)')
    .single();
  
  if (error) {
    console.error('Error adding exercise to workout:', error);
    throw error;
  }
  
  return data as WorkoutExercise;
};

// Update a workout's details
export const updateWorkout = async ({
  workoutId,
  newDate,
  exerciseUpdates,
  exercisesToRemove
}: {
  workoutId: string,
  newDate?: Date,
  exerciseUpdates?: { id: string, sets: number }[],
  exercisesToRemove?: string[]
}) => {
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
  
  // Update sets for existing exercises
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
  
  // Remove exercises from workout
  if (exercisesToRemove && exercisesToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('workout_exercises')
      .delete()
      .in('id', exercisesToRemove);
    
    if (deleteError) {
      console.error('Error removing exercises from workout:', deleteError);
      throw deleteError;
    }
  }
  
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