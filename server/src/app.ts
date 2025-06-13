import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export async function build(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
    const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

    // Register plugins
    await app.register(import('@fastify/cors'), {
        origin: true,  // Allow all origins in development
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
    });

    // Register Supabase plugin
    await app.register(import('./plugins/supabase.js'));

    // Register swagger plugin
    await app.register(import('./plugins/swagger.js'));

    // Register routes
    await app.register(import('./routes/index.js'), { prefix: '/api/v1' });

    // Health check
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    return app;
} 