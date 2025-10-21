# NextWorkout Architecture

## Overview

NextWorkout is a **monorepo** full-stack workout tracking application structure using npm workspaces for shared dependencies + cross-package scripts. The application follows a **client-server architecture** with a React-based SPA frontend and a Fastify-based backend API, connected to a Supabase PostgreSQL database for data persistence and authentication.


## 1. Client Layer (Frontend SPA)

React-based single-page application built with Vite and TypeScript. The client follows a **services pattern** where API logic, React Query hooks, and TypeScript types are organized by domain (workouts, exercises, exercise groups).

**Understanding React Hooks:** A React hook is a special function that "hooks into" React features like state and lifecycle. Hooks must start with `use` (e.g., `useState`, `useEffect`) and can only be called inside React components or other custom hooks. Custom hooks (like `useWorkouts()` or `useExercisesForGroups()`) are reusable functions that encapsulate stateful logic—they can manage their own state, trigger side effects (like API calls), and return data and functions to the component that calls them.

**The Services Pattern:** The client organizes API logic into domain folders (workouts, exercises, exerciseGroups). Each domain has three files:
1. **`api.ts`** - Plain functions that call the Fastify backend (e.g., `fetchWorkouts()` uses `fetch()` to hit `/api/v1/workouts`)
2. **`hooks.ts`** - React Query hooks that wrap the `api.ts` functions (e.g., `useWorkouts()` wraps `fetchWorkouts()` and adds caching, loading states, error handling). The frontend components call these hooks
3. **`types.ts`** - TypeScript interfaces that define the shape of data (e.g., `Workout`, `Exercise`)

```
client/src/
├── components/              # React UI components, both custom and shadcn
│
├── contexts/                # React Context providers
│   └── AuthContext.tsx          # Global auth state (user, session, sign in/out)
│
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx           # Utility: Detect mobile viewport
│   ├── use-toast.ts             # Utility: Toast notifications (from shadcn)
│   └── useExercisesForGroups.ts # Domain: Fetch & organize exercises by group
│
├── lib/                     # Central utility functions that apply across multiple domains
│   ├── api.ts                   # HTTP client (fetchApi) with auth headers
│   ├── supabase.ts              # Supabase client initialization
│   └── utils.ts                 # General utilities (e.g., cn for classnames)
│
├── pages/                   # Route pages (components mounted by React Router)
│   ├── Auth.tsx                 # Login/signup page
│   ├── Home.tsx                 # Main dashboard
│   ├── RecordWorkout.tsx        # Create new workout
│   ├── ...
│
├── services/                # Domain-specific API logic (organized by entity)
│   ├── workouts/
│   │   ├── api.ts               # Raw API calls (fetchWorkouts, postWorkout, etc.)
│   │   ├── hooks.ts             # React Query hooks (useWorkouts, useCreateWorkout, etc.)
│   │   ├── types.ts             # TypeScript interfaces (Workout, WorkoutExercise)
│   │
│   ├── exercises/...
│   │
│   ├── exerciseGroups/...
│   │
│   └── queryKeys.ts             # Centralized React Query cache keys
│
├── App.tsx                  # Root component (routing, providers)
├── main.tsx                 # Entry point (renders App)
└── vite-env.d.ts            # Vite type declarations
```


## 2. Server Layer (Backend API)

Fastify-based REST API server that handles business logic, authentication, and database operations. The server follows a **layered architecture** where routes handle HTTP concerns, services contain business logic, and schemas define validation rules.

- **Routes:** Defines the REST endpoints (GET /exercises, POST /exercises, etc.) for each data type, validates the request body using schemas defined in `/schemas`, calls the relevant service method from `/services`, and then formats the response before returning to client.
- **Services:** Classes with methods that contain business logic and database operations--they're stateless (don't remember anything between calls) and receive a user-scoped Supabase client as a parameter + make calls to supabase
   - Note that RLS (row-level security) policies automatically filter data by the authenticated user
- **Schemas:** Use TypeBox (JSON Schema) to define request/response validation rules and automatically generate TypeScript types.

```
server/src/
├── lib/                     # Utility functions
│   └── auth.ts                  # verifyAuth middleware (JWT verification)
│
├── plugins/                 # Fastify plugins (cross-cutting concerns)
│   ├── supabase.ts              # Supabase client injection (decorates request)
│   └── swagger.ts               # OpenAPI/Swagger documentation config
│
├── routes/                  # HTTP endpoint handlers (organized by resource)
│   ├── auth.ts                  # /auth endpoints (login, signup, logout)
│   ├── workouts.ts              # /workouts CRUD endpoints
│   ├── ...
│
├── schemas/                 # TypeBox validation schemas (JSON Schema)
│   ├── auth.ts                  # Login/signup schemas
│   ├── workouts.ts              # Workout entity schemas
│   ├── ...
│   └── common.ts                # Shared schemas (e.g., IdParamSchema)
│
├── services/                # Business logic (stateless classes)
│   ├── workouts.ts              # WorkoutService class (CRUD + business rules)
│   ├── exercises.ts             # ExerciseService class
│   └── exerciseGroups.ts        # ExerciseGroupService class
│
├── types/                   # TypeScript type definitions
│   └── fastify.d.ts             # Extends Fastify types (adds supabaseClient)
│
├── app.ts                   # Fastify app factory (registers plugins & routes)
└── server.ts                # Entry point (loads env, calls build(), starts server)
```



### Key Technologies / Special Files

**TODO**
- better understand typebox/swagger/openAPI
- better understand how fastify plugins work
- better understand middleware
- finish cleaning up the rest of this section

**@psteinroe/fastify-supabase** (plugins/supabase.ts:5-14)
- Fastify plugin that decorates the request object with a user-scoped Supabase client
- Reads JWT token from `Authorization` header
- Creates `request.supabaseClient` authenticated as the user in the token
- RLS policies automatically filter queries by `auth.uid()`
- Also decorates `fastify.supabaseClient` (service role client for auth operations)

**Supabase Client** (request.supabaseClient)
- JavaScript client for querying PostgreSQL via Supabase
- User-scoped client automatically filters by RLS policies
- Methods: `.from(table).select()`, `.insert()`, `.update()`, `.delete()`
- Returns `{ data, error }` tuple (error is null on success)

- **`lib/auth.ts`**: Middleware function that takes in a request object and verifies that it has a valid JWT token
- **`plugins/supabase.ts`**
   - Registers `@psteinroe/fastify-supabase` plugin
   - Configures with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
   - Decorates `fastify.supabaseClient` (service role, used in auth routes)
   - Decorates `request.supabaseClient` (user-scoped, used in protected routes)

- **`types/fastify.d.ts`**
- TypeScript declaration merging to extend Fastify types
- Adds `supabaseClient: SupabaseClient` to `FastifyInstance` and `FastifyRequest`
- Allows TypeScript to recognize `request.supabaseClient` and `fastify.supabaseClient`


## 3. Data Layer (Supabase)

PostgreSQL database hosted on Supabase with Row Level Security (RLS) policies for multi-tenant data isolation.

**Core Entities:**
- **users** - User accounts (managed by Supabase Auth)
- **exercises** - Exercise definitions (user-specific)
- **exercise_groups** - Groupings of exercises
- **workouts** - Workout sessions with timestamps
- **workout_exercises** - Join table linking workouts to exercises with sets/reps