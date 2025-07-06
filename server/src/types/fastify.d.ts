import { SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
    interface FastifyInstance {
        supabaseClient: SupabaseClient;
    }
    
    interface FastifyRequest {
        supabaseClient: SupabaseClient;
    }
} 