
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ExerciseGroup {
  id: string;
  name: string;
  color: string;
  num_exercises_to_show: number;
  user_id: string;
}

// Fetch all exercise groups for the current user
export const fetchExerciseGroups = async () => {
  try {
    const { data, error } = await supabase
      .from('exercise_groups')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching exercise groups:', error);
      if (error.code === '42P01') {
        throw new Error('The exercise_groups table does not exist. Please set up your database first.');
      }
      throw error;
    }
    
    return data as ExerciseGroup[];
  } catch (error: any) {
    console.error('Error in fetchExerciseGroups:', error);
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
      console.error('Error creating exercise group:', error);
      if (error.code === '42P01') {
        throw new Error('The exercise_groups table does not exist. Please set up your database first.');
      }
      throw error;
    }
    
    return data as ExerciseGroup;
  } catch (error: any) {
    console.error('Detailed error in createExerciseGroup:', error);
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
      console.error('Error updating exercise group:', error);
      if (error.code === '42P01') {
        throw new Error('The exercise_groups table does not exist. Please set up your database first.');
      }
      throw error;
    }
    
    return data as ExerciseGroup;
  } catch (error: any) {
    console.error('Error in updateExerciseGroup:', error);
    throw error;
  }
};

// Delete an exercise group
export const deleteExerciseGroup = async (id: string) => {
  try {
    const { error } = await supabase
      .from('exercise_groups')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting exercise group:', error);
      if (error.code === '42P01') {
        throw new Error('The exercise_groups table does not exist. Please set up your database first.');
      }
      throw error;
    }
    
    return id;
  } catch (error: any) {
    console.error('Error in deleteExerciseGroup:', error);
    throw error;
  }
};

// React Query hooks
export const useExerciseGroups = () => {
  return useQuery({
    queryKey: ['exerciseGroups'],
    queryFn: fetchExerciseGroups
  });
};

export const useCreateExerciseGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExerciseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
    }
  });
};

export const useUpdateExerciseGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExerciseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
    }
  });
};

export const useDeleteExerciseGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExerciseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
    }
  });
};
