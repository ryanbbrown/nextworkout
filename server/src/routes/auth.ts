import { FastifyPluginAsync } from 'fastify';
import { LoginSchema, SignupSchema, AuthResponseSchema, MessageResponseSchema, LoginRequest, SignupRequest } from '../schemas/auth.js';

const auth: FastifyPluginAsync = async (fastify) => {

    // POST /auth/login
    fastify.post<{ Body: LoginRequest }>('/login', {
        schema: {
            tags: ['auth'],
            body: LoginSchema,
            response: {
                200: AuthResponseSchema,
                400: { type: 'object', properties: { error: { type: 'string' } } },
                401: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { email, password } = request.body;
            
            const { data, error } = await fastify.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return reply.code(401).send({ error: error.message });
            }

            if (!data.user || !data.session) {
                return reply.code(401).send({ error: 'Authentication failed' });
            }

            return reply.send({
                user: {
                    id: data.user.id,
                    email: data.user.email!,
                    created_at: data.user.created_at
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_in: data.session.expires_in,
                    token_type: data.session.token_type
                }
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });

    // POST /auth/signup
    fastify.post<{ Body: SignupRequest }>('/signup', {
        schema: {
            tags: ['auth'],
            body: SignupSchema,
            response: {
                200: MessageResponseSchema,
                400: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { email, password } = request.body;
            
            const { error } = await fastify.supabaseClient.auth.signUp({
                email,
                password
            });

            if (error) {
                return reply.code(400).send({ error: error.message });
            }

            return reply.send({
                message: 'Account created successfully. Check your email for the confirmation link.'
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });

    // POST /auth/logout
    fastify.post('/logout', {
        schema: {
            tags: ['auth'],
            response: {
                200: MessageResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            // Get the authorization header
            const authHeader = request.headers.authorization;
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                
                // Use the service role client to revoke the token
                await fastify.supabaseClient.auth.admin.signOut(token);
            }

            return reply.send({
                message: 'Logged out successfully'
            });
        } catch (error) {
            request.log.error(error);
            // Even if logout fails on the server, we should return success
            // since the client will clear the token anyway
            return reply.send({
                message: 'Logged out successfully'
            });
        }
    });
};

export default auth; 