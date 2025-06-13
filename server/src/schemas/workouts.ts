import { Type } from '@fastify/type-provider-typebox';

export const ExerciseSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    group_id: Type.String({ format: 'uuid' })
}, {
    additionalProperties: false
});

export const WorkoutExerciseSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    workout_id: Type.String({ format: 'uuid' }),
    exercise_id: Type.String({ format: 'uuid' }),
    sets: Type.Number({ minimum: 1 }),
    user_id: Type.Optional(Type.String({ format: 'uuid' })),
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.Optional(Type.String({ format: 'date-time' })),
    exercise: Type.Optional(ExerciseSchema)
}, {
    additionalProperties: false
});

export const WorkoutSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.Optional(Type.String()),
    workout_date: Type.String({ format: 'date-time' }),
    user_id: Type.Optional(Type.String({ format: 'uuid' })),
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.Optional(Type.String({ format: 'date-time' })),
    workout_exercises: Type.Optional(Type.Array(WorkoutExerciseSchema))
}, {
    additionalProperties: false
});

export const CreateWorkoutInputSchema = Type.Object({
    user_id: Type.Optional(Type.String({ format: 'uuid' })),
    notes: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    created_at: Type.Optional(Type.String({ format: 'date-time' })),
    updated_at: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
    workout_date: Type.String({ format: 'date-time' })
}, {
    additionalProperties: false
});

export const CreateWorkoutSchema = Type.Object({
    workout: CreateWorkoutInputSchema,
    workoutExercises: Type.Array(Type.Object({
        exercise_id: Type.String({ format: 'uuid' }),
        sets: Type.Number({ minimum: 1 }),
        user_id: Type.Optional(Type.String({ format: 'uuid' }))
    }))
}, {
    additionalProperties: false
});

export const UpdateWorkoutSchema = Type.Object({
    newDate: Type.Optional(Type.String({ format: 'date-time' })),
    exerciseUpdates: Type.Optional(Type.Array(Type.Object({
        id: Type.String({ format: 'uuid' }),
        sets: Type.Number({ minimum: 1 })
    }))),
    exercisesToRemove: Type.Optional(Type.Array(Type.String({ format: 'uuid' })))
}, {
    additionalProperties: false
});

// Response schemas
export const WorkoutResponseSchema = Type.Object({
    data: WorkoutSchema
});

export const WorkoutsResponseSchema = Type.Object({
    data: Type.Array(WorkoutSchema)
});

// Error schema
export const ErrorSchema = Type.Object({
    error: Type.String()
});

// TypeScript types
export interface RouteParams {
    id: string;
} 