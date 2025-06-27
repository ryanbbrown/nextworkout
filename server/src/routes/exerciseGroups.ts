import { FastifyPluginAsync } from 'fastify';
import { ExerciseGroupService } from '../services/exerciseGroups.js';
import {
    ExerciseGroupSchema,
    CreateExerciseGroupSchema,
    UpdateExerciseGroupSchema,
    ExerciseGroupsResponseSchema,
    ExerciseGroupResponseSchema,
    ErrorSchema
} from '../schemas/exerciseGroups.js';
import { IdParamSchema } from '../schemas/common.js';
import { Static } from '@fastify/type-provider-typebox';
import { verifyAuth } from '../lib/auth.js';

type CreateExerciseGroup = Static<typeof CreateExerciseGroupSchema>;
type UpdateExerciseGroup = Static<typeof UpdateExerciseGroupSchema>;

const exerciseGroups: FastifyPluginAsync = async (fastify) => {
    const exerciseGroupService = new ExerciseGroupService();

    // GET /exercise-groups
    fastify.get('/', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercise-groups'],
            response: {
                200: ExerciseGroupsResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            // Use the per-request authenticated Supabase client
            const exerciseGroups = await exerciseGroupService.listExerciseGroups(request._supabaseClient);
            return reply.send({ data: exerciseGroups });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch exercise groups' });
        }
    });

    // POST /exercise-groups
    fastify.post<{ Body: CreateExerciseGroup }>('/', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercise-groups'],
            body: CreateExerciseGroupSchema,
            response: {
                201: ExerciseGroupResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exerciseGroup = await exerciseGroupService.createExerciseGroup(request.body, request._supabaseClient);
            return reply.code(201).send({ data: exerciseGroup });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to create exercise group' });
        }
    });

    // PATCH /exercise-groups/:id
    fastify.patch<{
        Params: Static<typeof IdParamSchema>;
        Body: UpdateExerciseGroup
    }>('/:id', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercise-groups'],
            params: IdParamSchema,
            body: UpdateExerciseGroupSchema,
            response: {
                200: ExerciseGroupResponseSchema,
                404: ErrorSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exerciseGroup = await exerciseGroupService.updateExerciseGroup({
                ...request.body,
                exerciseGroupId: request.params.id
            }, request._supabaseClient);
            if (!exerciseGroup) {
                return reply.code(404).send({ error: 'Exercise group not found' });
            }
            return reply.send({ data: exerciseGroup });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to update exercise group' });
        }
    });

    // DELETE /exercise-groups/:id
    fastify.delete<{
        Params: Static<typeof IdParamSchema>
    }>('/:id', {
        onRequest: [verifyAuth],
        schema: {
            tags: ['exercise-groups'],
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
            const id = await exerciseGroupService.deleteExerciseGroup(request.params.id, request._supabaseClient);
            return reply.send({ id });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to delete exercise group' });
        }
    });
};

export default exerciseGroups; 