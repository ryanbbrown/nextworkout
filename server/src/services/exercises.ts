import { FastifyInstance } from 'fastify';
import { Static } from '@fastify/type-provider-typebox';
import { CreateExerciseSchema, UpdateExerciseSchema, ExerciseSchema } from '../schemas/exercises.js';

type Exercise = Static<typeof ExerciseSchema>;
type CreateExercise = Static<typeof CreateExerciseSchema>;
type UpdateExercise = Static<typeof UpdateExerciseSchema>;

interface UpdateExerciseParams extends UpdateExercise {
    exerciseId: string;
}

export class ExerciseService {
    constructor(private fastify: FastifyInstance) { }

    async listExercises() {
        const { data, error } = await this.fastify.supabase
            .from('exercises')
            .select('*')
            .order('name');

        if (error) {
            this.fastify.log.error('Error listing exercises:', error);
            throw error;
        }

        // Log the first exercise to see its structure
        if (data && data.length > 0) {
            this.fastify.log.info('First exercise data:', JSON.stringify(data[0], null, 2));
        }

        return data as Exercise[];
    }

    async listExercisesByGroup(groupId: string) {
        if (!groupId) {
            return [] as Exercise[];
        }

        const { data, error } = await this.fastify.supabase
            .from('exercises')
            .select('*')
            .eq('group_id', groupId)
            .order('name');

        if (error) {
            this.fastify.log.error('Error listing exercises by group:', error);
            throw error;
        }

        return data as Exercise[];
    }

    async createExercise(exercise: CreateExercise) {
        const { data, error } = await this.fastify.supabase
            .from('exercises')
            .insert(exercise)
            .select()
            .single();

        if (error) {
            this.fastify.log.error('Error creating exercise:', error);
            throw error;
        }

        return data as Exercise;
    }

    async updateExercise(params: UpdateExerciseParams) {
        const { exerciseId, ...updates } = params;

        const { data, error } = await this.fastify.supabase
            .from('exercises')
            .update(updates)
            .eq('id', exerciseId)
            .select()
            .single();

        if (error) {
            this.fastify.log.error('Error updating exercise:', error);
            throw error;
        }

        return data as Exercise;
    }

    async deleteExercise(exerciseId: string) {
        const { error } = await this.fastify.supabase
            .from('exercises')
            .delete()
            .eq('id', exerciseId);

        if (error) {
            this.fastify.log.error('Error removing exercise:', error);
            throw error;
        }

        return exerciseId;
    }
} 