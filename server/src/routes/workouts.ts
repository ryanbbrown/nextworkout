import { FastifyPluginAsync } from 'fastify';
import { WorkoutService } from '../services/workouts.js';
import {
    WorkoutSchema,
    CreateWorkoutSchema,
    UpdateWorkoutSchema,
    WorkoutsResponseSchema,
    WorkoutResponseSchema,
    ErrorSchema
} from '../schemas/workouts.js';
import { IdParamSchema } from '../schemas/common.js';
import { Static } from '@fastify/type-provider-typebox';
import { verifyAuth } from '../lib/auth.js';

type CreateWorkout = Static<typeof CreateWorkoutSchema>;
type UpdateWorkout = Static<typeof UpdateWorkoutSchema>;

const workouts: FastifyPluginAsync = async (fastify) => {
    const workoutService = new WorkoutService();

    // GET /workouts
    fastify.get('/', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['workouts'],
            response: {
                200: WorkoutsResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const workouts = await workoutService.listWorkouts(request.supabaseClient);
            return reply.send({ data: workouts });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch workouts' });
        }
    });

    // POST /workouts
    fastify.post<{ Body: CreateWorkout }>('/', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['workouts'],
            body: CreateWorkoutSchema,
            response: {
                201: WorkoutResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const workout = await workoutService.createWorkout(request.body, request.supabaseClient);
            return reply.code(201).send({ data: workout });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to create workout' });
        }
    });

    // PATCH /workouts/:id
    fastify.patch<{
        Params: Static<typeof IdParamSchema>;
        Body: UpdateWorkout
    }>('/:id', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['workouts'],
            params: IdParamSchema,
            body: UpdateWorkoutSchema,
            response: {
                200: WorkoutResponseSchema,
                404: ErrorSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const workout = await workoutService.updateWorkout({
                ...request.body,
                workoutId: request.params.id
            }, request.supabaseClient);
            if (!workout) {
                return reply.code(404).send({ error: 'Workout not found' });
            }
            return reply.send({ data: workout });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to update workout' });
        }
    });

    // DELETE /workouts/:id
    fastify.delete<{
        Params: Static<typeof IdParamSchema>
    }>('/:id', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['workouts'],
            params: IdParamSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' }
                    }
                },
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const id = await workoutService.deleteWorkout(request.params.id, request.supabaseClient);
            return reply.send({ id });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to delete workout' });
        }
    });
};

export default workouts; 