import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

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
      console.error('Supabase error fetching exercise groups:', error);
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

// Delete an exercise group
export const deleteExerciseGroup = async (id: string) => {
  try {
    const { error } = await supabase
      .from('exercise_groups')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error deleting exercise group:', error);
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
    queryKey: queryKeys.exerciseGroups.list(),
    queryFn: fetchExerciseGroups
  });
};

export const useCreateExerciseGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExerciseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGroups.all });
    }
  });
};

export const useUpdateExerciseGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExerciseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGroups.all });
    }
  });
};

export const useDeleteExerciseGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExerciseGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGroups.all });
    }
  });
};
