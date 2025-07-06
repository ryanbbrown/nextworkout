import { Type } from '@fastify/type-provider-typebox';

export const LoginSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 })
});

export const SignupSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 })
});

export const AuthResponseSchema = Type.Object({
    user: Type.Object({
        id: Type.String(),
        email: Type.String(),
        created_at: Type.String()
    }),
    session: Type.Object({
        access_token: Type.String(),
        refresh_token: Type.String(),
        expires_in: Type.Number(),
        token_type: Type.String()
    })
});

export const MessageResponseSchema = Type.Object({
    message: Type.String()
});

export type LoginRequest = typeof LoginSchema.static;
export type SignupRequest = typeof SignupSchema.static;
export type AuthResponse = typeof AuthResponseSchema.static;
export type MessageResponse = typeof MessageResponseSchema.static; 