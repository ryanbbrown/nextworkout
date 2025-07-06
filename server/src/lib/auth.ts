import { FastifyRequest, FastifyReply } from 'fastify';

export const verifyAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Verify the JWT token - the plugin will automatically make
        // request.supabaseClient available as user-authenticated client
        await request.jwtVerify();
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
}; 