import { supabase } from '@/lib/supabase';
import { Exercise } from './types';

// List all exercises for the current user
export const listExercises = async () => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error listing exercises:', error);
        throw error;
    }

    return data as Exercise[];
};

// List exercises by group ID
export const listExercisesByGroup = async (groupId: string) => {
    if (!groupId) {
        return [] as Exercise[];
    }

    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('group_id', groupId)
        .order('name');

    if (error) {
        console.error('Error listing exercises by group:', error);
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

// Update an existing exercise
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

// Remove an exercise
export const removeExercise = async (id: string) => {
    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error removing exercise:', error);
        throw error;
    }

    return id;
}; 