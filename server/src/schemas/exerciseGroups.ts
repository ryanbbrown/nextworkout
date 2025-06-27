import { Type } from '@fastify/type-provider-typebox';

export const ExerciseGroupSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    color: Type.String(),
    num_exercises_to_show: Type.Number(),
    user_id: Type.String({ format: 'uuid' }),
    created_at: Type.Optional(Type.String({ format: 'date-time' })),
    updated_at: Type.Optional(Type.String({ format: 'date-time' }))
}, {
    additionalProperties: false
});

export const CreateExerciseGroupSchema = Type.Object({
    name: Type.String(),
    color: Type.String(),
    num_exercises_to_show: Type.Number(),
    user_id: Type.String({ format: 'uuid' })
}, {
    additionalProperties: false
});

export const UpdateExerciseGroupSchema = Type.Object({
    name: Type.String(),
    color: Type.String(),
    num_exercises_to_show: Type.Number()
}, {
    additionalProperties: false
});

// Response schemas
export const ExerciseGroupResponseSchema = Type.Object({
    data: ExerciseGroupSchema
});

export const ExerciseGroupsResponseSchema = Type.Object({
    data: Type.Array(ExerciseGroupSchema)
});

// Error schema
export const ErrorSchema = Type.Object({
    error: Type.String()
}); 