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

type CreateExercise = Static<typeof CreateExerciseSchema>;
type UpdateExercise = Static<typeof UpdateExerciseSchema>;

const exercises: FastifyPluginAsync = async (fastify) => {
    const exerciseService = new ExerciseService(fastify);

    // GET /exercises
    fastify.get('/', {
        schema: {
            tags: ['exercises'],
            response: {
                200: ExercisesResponseSchema,
                500: ErrorSchema
            }
        }
    }, async (request, reply) => {
        try {
            const exercises = await exerciseService.listExercises();
            return reply.send({ data: exercises });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch exercises' });
        }
    });

    // GET /exercises/group/:groupId
    fastify.get<{ Params: { groupId: string } }>('/group/:groupId', {
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
            const exercises = await exerciseService.listExercisesByGroup(request.params.groupId);
            return reply.send({ data: exercises });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch exercises by group' });
        }
    });

    // POST /exercises
    fastify.post<{ Body: CreateExercise }>('/', {
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
            const exercise = await exerciseService.createExercise(request.body);
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
            });
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
            const id = await exerciseService.deleteExercise(request.params.id);
            return reply.send({ id });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to delete exercise' });
        }
    });
};

export default exercises; 