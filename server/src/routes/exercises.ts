import { FastifyPluginAsync } from 'fastify';
import { ExerciseService } from '../services/exercises.js';
import {
    ExerciseSchema,
    CreateExerciseSchema,
    UpdateExerciseSchema,
    ExercisesResponseSchema,
    ExerciseResponseSchema,
    ErrorSchema
} from '../schemas/exercises.js';
import { IdParamSchema } from '../schemas/common.js';
import { Static, Type } from '@fastify/type-provider-typebox';
import { verifyAuth } from '../lib/auth.js';

type CreateExercise = Static<typeof CreateExerciseSchema>;
type UpdateExercise = Static<typeof UpdateExerciseSchema>;

const exercises: FastifyPluginAsync = async (fastify) => {
    const exerciseService = new ExerciseService();

    // GET /exercises
    fastify.get('/', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercises'],
            response: {
                200: ExercisesResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exercises = await exerciseService.listExercises(request.supabaseClient);
            return reply.send({ data: exercises });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch exercises' });
        }
    });

    // GET /exercises/group/:groupId
    fastify.get<{ Params: { groupId: string } }>('/group/:groupId', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercises'],
            params: Type.Object({
                groupId: Type.String({ format: 'uuid' })
            }),
            response: {
                200: ExercisesResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exercises = await exerciseService.listExercisesByGroup(request.params.groupId, request.supabaseClient);
            return reply.send({ data: exercises });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch exercises by group' });
        }
    });

    // POST /exercises
    fastify.post<{ Body: CreateExercise }>('/', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercises'],
            body: CreateExerciseSchema,
            response: {
                201: ExerciseResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exercise = await exerciseService.createExercise(request.body, request.supabaseClient);
            return reply.code(201).send({ data: exercise });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to create exercise' });
        }
    });

    // PATCH /exercises/:id
    fastify.patch<{
        Params: Static<typeof IdParamSchema>;
        Body: UpdateExercise
    }>('/:id', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercises'],
            params: IdParamSchema,
            body: UpdateExerciseSchema,
            response: {
                200: ExerciseResponseSchema,
                404: ErrorSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exercise = await exerciseService.updateExercise({
                ...request.body,
                exerciseId: request.params.id
            }, request.supabaseClient);
            if (!exercise) {
                return reply.code(404).send({ error: 'Exercise not found' });
            }
            return reply.send({ data: exercise });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to update exercise' });
        }
    });

    // DELETE /exercises/:id
    fastify.delete<{
        Params: Static<typeof IdParamSchema>
    }>('/:id', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercises'],
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
            const id = await exerciseService.deleteExercise(request.params.id, request.supabaseClient);
            return reply.send({ id });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to delete exercise' });
        }
    });
};

export default exercises; 