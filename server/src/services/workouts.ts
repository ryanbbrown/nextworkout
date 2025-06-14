import { FastifyInstance } from 'fastify';
import { Static } from '@fastify/type-provider-typebox';
import { CreateWorkoutSchema, UpdateWorkoutSchema, WorkoutSchema } from '../schemas/workouts.js';

type Workout = Static<typeof WorkoutSchema>;
type CreateWorkout = Static<typeof CreateWorkoutSchema>;
type UpdateWorkout = Static<typeof UpdateWorkoutSchema>;

interface WorkoutExercise {
    exercise_id: string;
    sets: number;
    workout_id: string;
    user_id?: string;
}

interface UpdateWorkoutParams extends UpdateWorkout {
    workoutId: string;
}

export class WorkoutService {
    constructor(private fastify: FastifyInstance) { }

    async listWorkouts() {
        const { data, error } = await this.fastify.supabase
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
            this.fastify.log.error('Error listing workouts:', error);
            throw error;
        }

        return data as Workout[];
    }

    async createWorkout(request: CreateWorkout) {
        const { data: workoutData, error: workoutError } = await this.fastify.supabase
            .from('workouts')
            .insert(request.workout)
            .select()
            .single();

        if (workoutError) {
            this.fastify.log.error('Error creating workout:', workoutError);
            throw workoutError;
        }

        const workoutId = workoutData.id;

        if (request.workoutExercises && request.workoutExercises.length > 0) {
            const exercisesWithWorkoutId = request.workoutExercises.map((exercise): WorkoutExercise => ({
                ...exercise,
                workout_id: workoutId
            }));

            const { error: exercisesError } = await this.fastify.supabase
                .from('workout_exercises')
                .insert(exercisesWithWorkoutId);

            if (exercisesError) {
                this.fastify.log.error('Error adding workout exercises:', exercisesError);
                throw exercisesError;
            }
        }

        return workoutData as Workout;
    }

    async updateWorkout(params: UpdateWorkoutParams) {
        const { workoutId, newDate, exerciseUpdates, exercisesToRemove } = params;

        if (newDate) {
            const { error: workoutError } = await this.fastify.supabase
                .from('workouts')
                .update({
                    workout_date: newDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', workoutId);

            if (workoutError) {
                this.fastify.log.error('Error updating workout date:', workoutError);
                throw workoutError;
            }
        }

        if (exerciseUpdates && exerciseUpdates.length > 0) {
            for (const update of exerciseUpdates) {
                const { error: exerciseError } = await this.fastify.supabase
                    .from('workout_exercises')
                    .update({
                        sets: update.sets,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', update.id);

                if (exerciseError) {
                    this.fastify.log.error('Error updating workout exercise:', exerciseError);
                    throw exerciseError;
                }
            }
        }

        if (exercisesToRemove && exercisesToRemove.length > 0) {
            const { error: deleteError } = await this.fastify.supabase
                .from('workout_exercises')
                .delete()
                .in('id', exercisesToRemove);

            if (deleteError) {
                this.fastify.log.error('Error removing exercises from workout:', deleteError);
                throw deleteError;
            }
        }

        const { data, error } = await this.fastify.supabase
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
            this.fastify.log.error('Error fetching updated workout:', error);
            throw error;
        }

        return data as Workout;
    }

    async deleteWorkout(workoutId: string) {
        const { error } = await this.fastify.supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

        if (error) {
            this.fastify.log.error('Error removing workout:', error);
            throw error;
        }

        return workoutId;
    }
} 