import { supabase } from '@/lib/supabase';
import { ExerciseGroup } from './types';

// List all exercise groups for the current user
export const listExerciseGroups = async () => {
  try {
    const { data, error } = await supabase
      .from('exercise_groups')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Supabase error listing exercise groups:', error);
      throw error;
    }
    
    return data as ExerciseGroup[];
  } catch (error: any) {
    console.error('Error in listExerciseGroups:', error);
    throw error;
  }
};

// Create a new exercise group
export const createExerciseGroup = async (exerciseGroup: Omit<ExerciseGroup, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('exercise_groups')
      .insert(exerciseGroup)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating exercise group:', error);
      throw error;
    }
    
    return data as ExerciseGroup;
  } catch (error: any) {
    console.error('Error in createExerciseGroup:', error);
    throw error;
  }
};

// Update an exercise group
export const updateExerciseGroup = async (exerciseGroup: ExerciseGroup) => {
  try {
    const { data, error } = await supabase
      .from('exercise_groups')
      .update({
        name: exerciseGroup.name,
        color: exerciseGroup.color,
        num_exercises_to_show: exerciseGroup.num_exercises_to_show
      })
      .eq('id', exerciseGroup.id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error updating exercise group:', error);
      throw error;
    }
    
    return data as ExerciseGroup;
  } catch (error: any) {
    console.error('Error in updateExerciseGroup:', error);
    throw error;
  }
};

// Remove an exercise group
export const removeExerciseGroup = async (id: string) => {
  try {
    const { error } = await supabase
      .from('exercise_groups')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error removing exercise group:', error);
      throw error;
    }
    
    return id;
  } catch (error: any) {
    console.error('Error in removeExerciseGroup:', error);
    throw error;
  }
}; 