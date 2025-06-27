import { SupabaseClient } from '@supabase/supabase-js';
import { Static } from '@fastify/type-provider-typebox';
import { ExerciseGroupSchema, CreateExerciseGroupSchema, UpdateExerciseGroupSchema } from '../schemas/exerciseGroups.js';

type ExerciseGroup = Static<typeof ExerciseGroupSchema>;
type CreateExerciseGroup = Static<typeof CreateExerciseGroupSchema>;
type UpdateExerciseGroup = Static<typeof UpdateExerciseGroupSchema>;

interface UpdateExerciseGroupParams extends UpdateExerciseGroup {
    exerciseGroupId: string;
}

export class ExerciseGroupService {
    constructor() { }

    async listExerciseGroups(supabase: SupabaseClient) {
        const { data, error } = await supabase
            .from('exercise_groups')
            .select('*')
            .order('id');

        if (error) {
            throw error;
        }

        return data as ExerciseGroup[];
    }

    async createExerciseGroup(request: CreateExerciseGroup, supabase: SupabaseClient) {
        const { data, error } = await supabase
            .from('exercise_groups')
            .insert(request)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as ExerciseGroup;
    }

    async updateExerciseGroup(params: UpdateExerciseGroupParams, supabase: SupabaseClient) {
        const { exerciseGroupId, ...updateData } = params;

        const { data, error } = await supabase
            .from('exercise_groups')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', exerciseGroupId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as ExerciseGroup;
    }

    async deleteExerciseGroup(exerciseGroupId: string, supabase: SupabaseClient) {
        const { error } = await supabase
            .from('exercise_groups')
            .delete()
            .eq('id', exerciseGroupId);

        if (error) {
            throw error;
        }

        return exerciseGroupId;
    }
} 