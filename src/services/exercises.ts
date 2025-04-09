import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  group_id: string;
  user_id: string;
  last_performed: string | null;
  last_dequeued: string | null;
}

// Fetch all exercises for the current user
export const fetchExercises = async () => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
  
  return data as Exercise[];
};

// Fetch exercises by group ID
export const fetchExercisesByGroup = async (groupId: string) => {
  if (!groupId) {
    return [] as Exercise[];
  }
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('group_id', groupId)
    .order('name');
  
  if (error) {
    console.error('Error fetching exercises by group:', error);
    throw error;
  }
  
  return data as Exercise[];
};

// Create a new exercise
export const createExercise = async (exercise: Omit<Exercise, 'id'>) => {
  const { data, error } = await supabase
    .from('exercises')
    .insert(exercise)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
  
  return data as Exercise;
};

// Update an exercise
export const updateExercise = async (exercise: Exercise) => {
  const { data, error } = await supabase
    .from('exercises')
    .update({
      name: exercise.name,
      description: exercise.description,
      group_id: exercise.group_id,
      last_performed: exercise.last_performed,
      last_dequeued: exercise.last_dequeued
    })
    .eq('id', exercise.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
  
  return data as Exercise;
};

// Delete an exercise
export const deleteExercise = async (id: string) => {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
  
  return id;
};

// React Query hooks
export const useExercises = () => {
  return useQuery({
    queryKey: queryKeys.exercises.list(),
    queryFn: fetchExercises
  });
};

export const useExercisesByGroup = (groupId: string) => {
  return useQuery({
    queryKey: queryKeys.exercises.byGroup(groupId),
    queryFn: () => fetchExercisesByGroup(groupId),
    enabled: !!groupId
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExercise,
    onSuccess: (exercise) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.byGroup(exercise.group_id) });
    }
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExercise,
    onSuccess: (exercise) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.byGroup(exercise.group_id) });
    }
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
    }
  });
};
