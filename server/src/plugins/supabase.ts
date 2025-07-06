import fastifySupabase from '@psteinroe/fastify-supabase';
import fp from 'fastify-plugin';

export default fp(async function (fastify) {
    await fastify.register(fastifySupabase, {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!,
        serviceKey: process.env.SUPABASE_SERVICE_KEY!,
        options: {
            auth: {
                persistSession: false
            }
        }
    });

    // Debug: Log what gets decorated
    fastify.log.info('Supabase plugin registered. Available properties:', Object.keys(fastify));
}, {
    name: 'supabase-plugin'
}); 