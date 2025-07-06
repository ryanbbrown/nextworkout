import { SupabaseClient } from '@supabase/supabase-js';
import { Static } from '@fastify/type-provider-typebox';
import { CreateExerciseSchema, UpdateExerciseSchema, ExerciseSchema } from '../schemas/exercises.js';

type Exercise = Static<typeof ExerciseSchema>;
type CreateExercise = Static<typeof CreateExerciseSchema>;
type UpdateExercise = Static<typeof UpdateExerciseSchema>;

interface UpdateExerciseParams extends UpdateExercise {
    exerciseId: string;
}

export class ExerciseService {
    async listExercises(supabase: SupabaseClient) {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('name');

        if (error) {
            throw error;
        }

        return data as Exercise[];
    }

    async listExercisesByGroup(groupId: string, supabase: SupabaseClient) {
        if (!groupId) {
            return [] as Exercise[];
        }

        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('group_id', groupId)
            .order('name');

        if (error) {
            throw error;
        }

        return data as Exercise[];
    }

    async createExercise(exercise: CreateExercise, supabase: SupabaseClient) {
        const { data, error } = await supabase
            .from('exercises')
            .insert(exercise)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as Exercise;
    }

    async updateExercise(params: UpdateExerciseParams, supabase: SupabaseClient) {
        const { exerciseId, ...updates } = params;

        const { data, error } = await supabase
            .from('exercises')
            .update(updates)
            .eq('id', exerciseId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as Exercise;
    }

    async deleteExercise(exerciseId: string, supabase: SupabaseClient) {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', exerciseId);

        if (error) {
            throw error;
        }

        return exerciseId;
    }
} 