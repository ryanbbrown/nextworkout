import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

export const verifyAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Verify the JWT token
        const decoded = await request.jwtVerify();
        
        // Create an authenticated Supabase client with the user's JWT
        const authorizationHeader = request.headers.authorization;
        if (!authorizationHeader) {
            return reply.code(401).send({ error: 'No authorization header' });
        }
        
        const token = authorizationHeader.replace('Bearer ', '');
        
        // Create a Supabase client with the user's access token
        const supabaseClient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                },
                auth: {
                    persistSession: false
                }
            }
        );
        
        // Attach the authenticated client to the request
        request._supabaseClient = supabaseClient;
        
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
}; 