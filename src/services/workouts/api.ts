
import { supabase } from '@/lib/supabase';
import { Workout, WorkoutExercise } from './types';

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
    
    // The trigger will now handle updating last_performed
    // No need to manually update last_performed dates here
  }
  
  return workoutData as Workout;
};

// Delete a workout and its exercises
export const deleteWorkout = async (workoutId: string) => {
  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', workoutId);
  
  if (exercisesError) {
    console.error('Error deleting workout exercises:', exercisesError);
    throw exercisesError;
  }
  
  const { error: workoutError } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);
  
  if (workoutError) {
    console.error('Error deleting workout:', workoutError);
    throw workoutError;
  }
  
  // The trigger will now handle updating last_performed
  // after the workout exercises are deleted
  
  return workoutId;
};

// Add a new exercise to an existing workout
export const addExerciseToWorkout = async (workoutId: string, exerciseId: string, sets: number, userId?: string) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      sets: sets,
      user_id: userId, // Include user_id in the insert
    })
    .select('*, exercise:exercises(*)')
    .single();
  
  if (error) {
    console.error('Error adding exercise to workout:', error);
    throw error;
  }
  
  // The trigger will now handle updating last_performed
  
  return data as WorkoutExercise;
};

// Update a workout's date or exercise sets
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
  
  if (exercisesToRemove && exercisesToRemove.length > 0) {
    for (const exerciseId of exercisesToRemove) {
      const { error: deleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (deleteError) {
        console.error('Error removing exercise from workout:', deleteError);
        throw deleteError;
      }
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
