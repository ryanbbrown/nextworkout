import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function build(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
    const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

    // Register plugins
    await app.register(import('@fastify/cors'), {
        origin: true,  // Allow all origins in development
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
    });

    // Register JWT plugin (required for Supabase auth)
    await app.register(import('@fastify/jwt'), {
        secret: process.env.SUPABASE_JWT_SECRET!
    });

    // Register Supabase plugin
    await app.register(import('./plugins/supabase.js'));

    // Register swagger plugin
    await app.register(import('./plugins/swagger.js'));

    // Register routes
    await app.register(import('./routes/index.js'), { prefix: '/api/v1' });

    // Serve static files from the client build
    await app.register(import('@fastify/static'), {
        root: path.join(__dirname, '../../client/dist'),
        prefix: '/',
    });

    // Health check
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    // Catch-all for React Router (must be last)
    app.setNotFoundHandler(async (request, reply) => {
        // If it's an API request, return 404
        if (request.url.startsWith('/api/')) {
            return reply.code(404).send({ error: 'Not Found' });
        }
        // Otherwise, serve the React app
        return reply.sendFile('index.html');
    });

    return app;
} 