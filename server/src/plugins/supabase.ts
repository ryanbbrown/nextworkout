import fp from 'fastify-plugin';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Extend FastifyInstance type to include supabase client
declare module 'fastify' {
    interface FastifyInstance {
        supabase: SupabaseClient;
    }
}

export default fp(async function (fastify) {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!, // Use service key for server-side
        {
            auth: {
                persistSession: false
            }
        }
    );

    // Decorate fastify instance with supabase client
    fastify.decorate('supabase', supabase);

    // Hook to handle cleanup - no signout needed for server-side client
    fastify.addHook('onClose', async () => {
        // Cleanup will be handled by Node process termination
    });
}); 