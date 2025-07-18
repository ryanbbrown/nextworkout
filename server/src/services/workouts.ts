import { SupabaseClient } from '@supabase/supabase-js';
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
    async listWorkouts(supabase: SupabaseClient) {
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
            throw error;
        }

        return data as Workout[];
    }

    async createWorkout(request: CreateWorkout, supabase: SupabaseClient) {
        const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .insert(request.workout)
            .select()
            .single();

        if (workoutError) {
            throw workoutError;
        }

        const workoutId = workoutData.id;

        if (request.workoutExercises && request.workoutExercises.length > 0) {
            const exercisesWithWorkoutId = request.workoutExercises.map((exercise): WorkoutExercise => ({
                ...exercise,
                workout_id: workoutId
            }));

            const { error: exercisesError } = await supabase
                .from('workout_exercises')
                .insert(exercisesWithWorkoutId);

            if (exercisesError) {
                throw exercisesError;
            }
        }

        return workoutData as Workout;
    }

    async updateWorkout(params: UpdateWorkoutParams, supabase: SupabaseClient) {
        const { workoutId, newDate, exerciseUpdates, exercisesToRemove } = params;

        if (newDate) {
            const { error: workoutError } = await supabase
                .from('workouts')
                .update({
                    workout_date: newDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', workoutId);

            if (workoutError) {
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
                    throw exerciseError;
                }
            }
        }

        if (exercisesToRemove && exercisesToRemove.length > 0) {
            const { error: deleteError } = await supabase
                .from('workout_exercises')
                .delete()
                .in('id', exercisesToRemove);

            if (deleteError) {
                throw deleteError;
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
            throw error;
        }

        return data as Workout;
    }

    async deleteWorkout(workoutId: string, supabase: SupabaseClient) {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

        if (error) {
            throw error;
        }

        return workoutId;
    }
} 