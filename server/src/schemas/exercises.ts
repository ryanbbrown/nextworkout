import { Type } from '@fastify/type-provider-typebox';

export const ExerciseSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.String(),
    group_id: Type.String({ format: 'uuid' }),
    user_id: Type.String({ format: 'uuid' }),
    last_performed: Type.Union([Type.String({ format: 'date' }), Type.Null()]),
    last_dequeued: Type.Union([Type.String({ format: 'date' }), Type.Null()]),
    created_at: Type.Optional(Type.String({ format: 'date-time' })),
    updated_at: Type.Optional(Type.String({ format: 'date-time' }))
}, {
    additionalProperties: false
});

export const CreateExerciseSchema = Type.Object({
    name: Type.String(),
    description: Type.String(),
    group_id: Type.String({ format: 'uuid' }),
    user_id: Type.String({ format: 'uuid' }),
    last_performed: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
    last_dequeued: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()]))
}, {
    additionalProperties: false
});

export const UpdateExerciseSchema = Type.Object({
    name: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    group_id: Type.Optional(Type.String({ format: 'uuid' })),
    last_performed: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
    last_dequeued: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()]))
}, {
    additionalProperties: false
});

// Response schemas
export const ExerciseResponseSchema = Type.Object({
    data: ExerciseSchema
});

export const ExercisesResponseSchema = Type.Object({
    data: Type.Array(ExerciseSchema)
});

// Error schema
export const ErrorSchema = Type.Object({
    error: Type.String()
});

// TypeScript types
export interface RouteParams {
    id: string;
} 