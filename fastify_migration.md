# Fastify Backend Migration Guide

## Overview
This guide provides detailed steps to migrate the NextWorkout project from its current client-only structure to a proper client-server architecture using Fastify v5 as the backend framework.

## Current Structure Analysis
- **Current:** `nextworkout/src/` (React app with Supabase direct client calls)
- **Target:** `nextworkout/client/src/` + `nextworkout/server/src/`
- **Database:** Currently using Supabase with direct client SDK calls
- **Frontend:** React + TypeScript + Vite + ShadCN/UI + TanStack Query

## Migration Steps

### Phase 1: Project Structure Reorganization

#### 1.1 Create New Directory Structure
```bash
mkdir -p client server
```

#### 1.2 Move Frontend Code
```bash
# Move current src to client
mv src client/
mv index.html client/
mv vite.config.ts client/
mv tailwind.config.ts client/
mv postcss.config.js client/
mv components.json client/
```

#### 1.3 Update Configuration Files
- **client/vite.config.ts**: Update paths and add proxy for API calls
- **client/tailwind.config.ts**: Update content paths to reference `./src/**/*`
- **tsconfig.json**: Create separate configs for client and server
- **package.json**: Update scripts to handle both client and server

### Phase 2: Fastify Server Setup

#### 2.1 Create Server Directory Structure
```
server/
├── src/
│   ├── routes/
│   │   ├── workouts.ts
│   │   ├── exercises.ts
│   │   ├── exerciseGroups.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── workouts.ts
│   │   ├── exercises.ts
│   │   └── exerciseGroups.ts
│   ├── schemas/
│   │   ├── workouts.ts
│   │   ├── exercises.ts
│   │   └── common.ts
│   ├── plugins/
│   │   ├── supabase.ts
│   │   ├── cors.ts
│   │   └── swagger.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
└── tsconfig.json
```

#### 2.2 Install Fastify Dependencies
```bash
npm install fastify@^5.0.0 @fastify/cors @fastify/swagger @fastify/swagger-ui @fastify/type-provider-json-schema-to-ts
npm install -D @types/node tsx nodemon
```

#### 2.3 Create Core Server Files

**server/src/server.ts**
```typescript
import { build } from './app.js';

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
```

**server/src/app.ts**
```typescript
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export async function build(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

  // Register plugins
  await app.register(import('./plugins/cors.js'));
  await app.register(import('./plugins/supabase.js'));
  await app.register(import('./plugins/swagger.js'));

  // Register routes
  await app.register(import('./routes/index.js'), { prefix: '/api/v1' });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
```

### Phase 3: Route Migration

#### 3.1 Create JSON Schemas (Fastify v5 requirement)
**server/src/schemas/workouts.ts**
```typescript
export const WorkoutSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    workout_date: { type: 'string', format: 'date-time' },
    user_id: { type: 'string', format: 'uuid' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['name', 'workout_date', 'user_id']
} as const;

export const CreateWorkoutSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    workout_date: { type: 'string', format: 'date-time' },
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          exercise_id: { type: 'string', format: 'uuid' },
          sets: { type: 'number', minimum: 1 }
        },
        required: ['exercise_id', 'sets']
      }
    }
  },
  required: ['name', 'workout_date']
} as const;
```

#### 3.2 Migrate Routes
**server/src/routes/workouts.ts**
```typescript
import { FastifyPluginAsync } from 'fastify';
import { Type } from '@fastify/type-provider-typebox';
import { WorkoutSchema, CreateWorkoutSchema } from '../schemas/workouts.js';
import * as workoutService from '../services/workouts.js';

const workouts: FastifyPluginAsync = async (fastify) => {
  // GET /workouts
  fastify.get('/', {
    schema: {
      tags: ['workouts'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: WorkoutSchema
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const workouts = await workoutService.listWorkouts();
      return reply.send({ data: workouts });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch workouts' });
    }
  });

  // POST /workouts
  fastify.post('/', {
    schema: {
      tags: ['workouts'],
      body: CreateWorkoutSchema,
      response: {
        201: WorkoutSchema
      }
    }
  }, async (request, reply) => {
    try {
      const workout = await workoutService.createWorkout(request.body);
      return reply.code(201).send(workout);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to create workout' });
    }
  });

  // Additional routes...
};

export default workouts;
```

### Phase 4: Service Layer Migration

#### 4.1 Move Database Logic to Server Services
- Move logic from `client/src/services/workouts/services.ts` to `server/src/services/workouts.ts`
- Update imports to use server-side Supabase client
- Add proper error handling and logging
- Implement authentication middleware

#### 4.2 Create Supabase Plugin
**server/src/plugins/supabase.ts**
```typescript
import fp from 'fastify-plugin';
import { createClient } from '@supabase/supabase-js';

export default fp(async function (fastify) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // Use service key for server-side
  );

  fastify.decorate('supabase', supabase);
});
```

### Phase 5: Frontend API Integration

#### 5.1 Update Client API Calls
- Replace direct Supabase calls with HTTP API calls to your Fastify server
- Update `client/src/services/*/api.ts` files to use fetch or axios
- Update TanStack Query hooks to call new API endpoints

**Example client/src/services/workouts/api.ts:**
```typescript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const fetchWorkouts = async () => {
  const response = await fetch(`${API_BASE}/workouts`);
  if (!response.ok) throw new Error('Failed to fetch workouts');
  return response.json();
};

export const postWorkout = async (workout: CreateWorkoutRequest) => {
  const response = await fetch(`${API_BASE}/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workout)
  });
  if (!response.ok) throw new Error('Failed to create workout');
  return response.json();
};
```

#### 5.2 Update Vite Configuration
**client/vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

### Phase 6: Configuration and Dependencies

#### 6.1 Update Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && vite",
    "dev:server": "cd server && tsx watch src/server.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && vite build",
    "build:server": "cd server && tsc",
    "start": "cd server && node dist/server.js"
  }
}
```

#### 6.2 Environment Variables
Create `.env` files for both client and server:

**server/.env:**
```
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

**client/.env:**
```
VITE_API_URL=http://localhost:3001/api/v1
```

#### 6.3 TypeScript Configuration
Create separate `tsconfig.json` files for client and server with appropriate settings.

### Phase 7: Additional Considerations

#### 7.1 Authentication & Security
- Implement JWT or session-based authentication
- Add rate limiting with `@fastify/rate-limit`
- Validate user permissions for all operations
- Use HTTPS in production

#### 7.2 Database Migrations
- Move SQL files to `server/migrations/`
- Consider using a migration tool like Prisma or Drizzle

#### 7.3 Error Handling
- Implement consistent error response format
- Add request/response logging
- Set up error monitoring (Sentry, etc.)

#### 7.4 Testing
- Add unit tests for services using Vitest
- Add integration tests for API endpoints
- Add E2E tests with Playwright

#### 7.5 Development Workflow
- Use `concurrently` to run both client and server in development
- Set up hot reload for both frontend and backend
- Configure debugging for both environments

## Dependencies to Add

### Server Dependencies
```bash
npm install fastify @fastify/cors @fastify/swagger @fastify/swagger-ui @fastify/type-provider-typebox @fastify/rate-limit fastify-plugin
npm install -D @types/node tsx nodemon concurrently
```

### Shared Dependencies
Keep existing dependencies in root `package.json` or move client-specific ones to `client/package.json`.

## Migration Checklist

- [x] Create new directory structure
- [x] Move frontend code to client folder
- [x] Set up Fastify server with proper structure
- [x] Create JSON schemas for all entities (Fastify v5 requirement)
- [x] Migrate database services to server
- [x] Create API routes with proper error handling
- [ ] Update client to use HTTP API instead of direct Supabase
- [x] Configure development environment with both client and server
- [x] Update build and deployment scripts
- [ ] Add authentication and security middleware
- [ ] Set up proper error handling and logging
- [ ] Add comprehensive testing
- [ ] Update documentation