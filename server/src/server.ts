import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { build } from './app.js';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const start = async () => {
    try {
        const app = await build({
            logger: {
                level: 'info',
                transport: process.env.NODE_ENV === 'development' ? {
                    target: 'pino-pretty'
                } : undefined
            }
        });

        const port = Number(process.env.PORT) || 3001;
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });
        console.log(`🚀 Server listening on http://${host}:${port}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

start(); 