# NextWorkout Architecture

## Overview

NextWorkout is a full-stack workout tracking application built with a **monorepo** structure using npm workspaces. The application follows a **client-server architecture** with a React-based SPA frontend and a Fastify-based backend API, both connected to a Supabase PostgreSQL database for data persistence and authentication.

## Core Layers

### 1. Client Layer (Frontend SPA)

React-based single-page application built with Vite and TypeScript. The client follows a **services pattern** where API logic, React Query hooks, and TypeScript types are organized by domain (workouts, exercises, exercise groups).

#### Client Folder Structure

**Understanding React Hooks:** A React hook is a special function that "hooks into" React features like state and lifecycle. Hooks must start with `use` (e.g., `useState`, `useEffect`) and can only be called inside React components or other custom hooks. Custom hooks (like `useWorkouts()` or `useExercisesForGroups()`) are reusable functions that encapsulate stateful logic—they can manage their own state, trigger side effects (like API calls), and return data and functions to the component that calls them.

**The Services Pattern:** The client organizes API logic into domain folders (workouts, exercises, exerciseGroups). Each domain has three files:
1. **`api.ts`** - Plain functions that call the Fastify backend (e.g., `fetchWorkouts()` uses `fetch()` to hit `/api/v1/workouts`)
2. **`hooks.ts`** - React Query hooks that wrap the `api.ts` functions (e.g., `useWorkouts()` wraps `fetchWorkouts()` and adds caching, loading states, error handling). The frontend components call these hooks
3. **`types.ts`** - TypeScript interfaces that define the shape of data (e.g., `Workout`, `Exercise`)
4. **`index.ts`** - Re-exports everything from the other three files so you can import like `import { useWorkouts, Workout } from '@/services/workouts'`

```
client/src/
├── components/              # React UI components
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
│   ├── ViewWorkouts.tsx         # List/manage workouts
│   ├── EditExercises.tsx        # Manage exercises & groups
│   ├── Index.tsx                # Landing page (redirects if logged in)
│   └── NotFound.tsx             # 404 page
│
├── services/                # Domain-specific API logic (organized by entity)
│   ├── workouts/
│   │   ├── api.ts               # Raw API calls (fetchWorkouts, postWorkout, etc.)
│   │   ├── hooks.ts             # React Query hooks (useWorkouts, useCreateWorkout, etc.)
│   │   ├── types.ts             # TypeScript interfaces (Workout, WorkoutExercise)
│   │   └── index.ts             # Re-exports all exports from api, hooks, types
│   │
│   ├── exercises/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── exerciseGroups/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── queryKeys.ts             # Centralized React Query cache keys
│
├── App.tsx                  # Root component (routing, providers)
├── main.tsx                 # Entry point (renders App)
└── vite-env.d.ts            # Vite type declarations
```

#### Services Pattern Explained

Each domain (workouts, exercises, exerciseGroups) follows a consistent **3-file pattern**:

1. **`api.ts`** - Raw API functions
   - Pure TypeScript functions that call the backend API
   - Use `fetchApi()` from `lib/api.ts` (handles auth headers automatically)
   - Return typed data (no React dependencies)
   - Example: `fetchWorkouts()`, `postWorkout()`, `deleteWorkout()`

2. **`hooks.ts`** - React Query hooks
   - Wraps `api.ts` functions with React Query's `useQuery` and `useMutation`
   - Handles caching, loading states, error states automatically
   - Invalidates related queries on mutation success (cache updates)
   - Example: `useWorkouts()` (read), `useCreateWorkout()` (write), `useDeleteWorkout()` (write)

3. **`types.ts`** - TypeScript interfaces
   - Defines the shape of domain entities
   - Matches the shape returned by the API
   - Example: `Workout`, `WorkoutExercise`, `Exercise`, `ExerciseGroup`

4. **`index.ts`** - Re-export barrel file
   - Simply re-exports everything from `api.ts`, `hooks.ts`, and `types.ts`
   - Allows clean imports: `import { useWorkouts, Workout } from '@/services/workouts'`

#### Key Technologies & Where They're Used

**React 18 + React Router** (App.tsx:38-65)
- `<BrowserRouter>` wraps the entire app
- `<Routes>` defines page mappings
- `<ProtectedRoute>` wrapper checks authentication before rendering pages
- Pages: Auth, Home, RecordWorkout, ViewWorkouts, EditExercises

**TanStack Query (React Query)** (services/*/hooks.ts)
- `useQuery` for fetching data (e.g., `useWorkouts()`, `useExercises()`)
- `useMutation` for creating/updating/deleting data (e.g., `useCreateWorkout()`)
- Automatic caching with `queryKeys` (services/queryKeys.ts)
- Cache invalidation on mutations (refetch related queries automatically)
- Global setup in App.tsx:15 with `<QueryClientProvider>`

**React Context** (contexts/AuthContext.tsx)
- Manages global authentication state (user, session, JWT token)
- Provides `useAuth()` hook to access auth state anywhere
- Handles sign in/sign up/sign out logic
- Persists session to localStorage
- Wrapped around entire app in App.tsx:35

**shadcn/ui + Radix UI** (components/ui/*)
- 50+ pre-built UI components (buttons, dialogs, forms, etc.)
- All components are copied into your codebase (not npm packages)
- Built on top of Radix UI primitives (accessible, unstyled components)
- Styled with Tailwind CSS utility classes
- Used throughout pages (e.g., Button, Card, Dialog, Form)

**Tailwind CSS**
- Utility-first CSS framework
- All components styled with utility classes (e.g., `className="flex items-center gap-2"`)
- No separate CSS files (styles inline with JSX)

**Zod** (not currently used in client)
- Runtime validation library (TypeScript schemas at runtime)
- You mentioned Zod but it's primarily used on the server side
- Client uses TypeScript interfaces for compile-time type checking only

#### Data Flow: Component → Hook → API → Server

Example: Loading workouts on the ViewWorkouts page

```
1. ViewWorkouts.tsx renders
   ↓
2. Calls const { data, isLoading } = useWorkouts()
   (from services/workouts/hooks.ts)
   ↓
3. React Query checks cache for queryKey ['workouts', 'list']
   ↓
4. If cache miss, calls fetchWorkouts()
   (from services/workouts/api.ts)
   ↓
5. fetchWorkouts() calls fetchApi('/workouts')
   (from lib/api.ts)
   ↓
6. fetchApi() adds Authorization: Bearer <token> header
   (token from localStorage)
   ↓
7. HTTP GET request to /api/v1/workouts
   ↓
8. Server returns { data: Workout[] }
   ↓
9. React Query caches response with key ['workouts', 'list']
   ↓
10. Component receives data and renders workout list
```

Example: Creating a new workout

```
1. RecordWorkout.tsx form is submitted
   ↓
2. Calls createWorkout.mutate({ workout, workoutExercises })
   (from const createWorkout = useCreateWorkout())
   ↓
3. useMutation calls postWorkout(...)
   (from services/workouts/api.ts)
   ↓
4. postWorkout() calls fetchApi('/workouts', { method: 'POST', body: ... })
   ↓
5. HTTP POST to /api/v1/workouts with workout data
   ↓
6. Server creates workout and returns { data: Workout }
   ↓
7. useMutation onSuccess callback fires
   ↓
8. Invalidates queryKey ['workouts'] (triggers refetch)
   ↓
9. useWorkouts() on ViewWorkouts page automatically refetches
   ↓
10. UI updates with new workout in the list
```

#### Special Files Explained

**`contexts/AuthContext.tsx`**
- Manages user authentication state globally
- Provides: `user`, `session`, `isLoading`, `signIn()`, `signUp()`, `signOut()`
- Stores JWT token in localStorage (key: `access_token`)
- Checks for existing session on mount (persistence)
- Used by `ProtectedRoute` to guard authenticated pages

**`hooks/useExercisesForGroups.ts`**
- Custom hook for a specific use case: fetching exercises and grouping them by group_id
- Not using React Query (legacy pattern, could be refactored)
- Fetches all exercises, then organizes into a map: `{ [groupId]: Exercise[] }`
- Used in pages that need to display exercises organized by group

**`lib/api.ts`**
- Core HTTP client used by all services
- `fetchApi<T>(endpoint, options)` - wrapper around native `fetch()`
- Automatically adds `Authorization: Bearer <token>` header
- Automatically adds `Content-Type: application/json` for requests with body
- Handles error responses (throws `APIError` with status code)
- `API_BASE` constant determines server URL (localhost in dev, relative path in production)

**`services/queryKeys.ts`**
- Centralized React Query cache key definitions
- Prevents typos and ensures consistent cache keys across the app
- Hierarchical structure: `['workouts']` → `['workouts', 'list']` → `['workouts', 'detail', id]`
- Used by hooks for `queryKey` and `invalidateQueries()`

### 2. Server Layer (Backend API)

Fastify-based REST API server that handles business logic, authentication, and database operations.

**Key Technologies:**
- **Fastify 5** with TypeBox for schema validation
- **@psteinroe/fastify-supabase** plugin for Supabase integration
- **@fastify/jwt** for JWT token verification
- **Swagger/OpenAPI** documentation with @fastify/swagger
- **TypeScript** for type safety

### 3. Data Layer (Supabase)

PostgreSQL database hosted on Supabase with Row Level Security (RLS) policies for multi-tenant data isolation.

**Core Entities:**
- **users** - User accounts (managed by Supabase Auth)
- **exercises** - Exercise definitions (user-specific)
- **exercise_groups** - Groupings of exercises
- **workouts** - Workout sessions with timestamps
- **workout_exercises** - Join table linking workouts to exercises with sets/reps



## Authentication Flow

1. **Sign Up/Login** (client/src/contexts/AuthContext.tsx:63-96)
   - User submits credentials via Auth page
   - Client calls `authApi.login()` or `authApi.signup()`
   - Server authenticates via Supabase Auth
   - Server returns `{ user, session }` with JWT access token
   - Client stores `access_token` in localStorage
   - Client stores user and session in React Context

2. **Authenticated Requests**
   - Client reads `access_token` from localStorage (client/src/lib/api.ts:46)
   - Adds `Authorization: Bearer <token>` header to all API requests
   - Server verifies JWT via `verifyAuth` middleware (server/src/lib/auth.ts:3)
   - `@psteinroe/fastify-supabase` plugin creates user-scoped Supabase client
   - All database queries automatically filtered by RLS policies

3. **Protected Routes**
   - Client uses `ProtectedRoute` wrapper component
   - Checks for `user` in AuthContext
   - Redirects to login if not authenticated


## Code Organization

### Monorepo Structure

```
nextworkout/
├── client/                    # React SPA
│   └── src/
│       ├── components/        # UI components (shadcn/ui)
│       ├── contexts/          # React Context providers
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utilities (api.ts, supabase.ts)
│       ├── pages/             # Route page components
│       └── App.tsx            # Main app with routing
│
├── server/                    # Fastify API
│   └── src/
│       ├── lib/               # Utilities (auth.ts)
│       ├── plugins/           # Fastify plugins (supabase, swagger)
│       ├── routes/            # API route handlers
│       ├── schemas/           # Zod validation schemas
│       ├── services/          # Business logic layer
│       ├── types/             # TypeScript type definitions
│       ├── app.ts             # Fastify app builder
│       └── server.ts          # Server entry point
│
├── sql/                       # Database migrations and views
├── package.json               # Root workspace config
└── README.md
```

### Server Architecture Pattern

The server follows a **layered architecture**:

1. **Routes** - HTTP endpoints, request validation, response formatting
2. **Services** - Business logic, orchestration, database operations
3. **Schemas** - Zod schemas for validation and type generation
4. **Plugins** - Cross-cutting concerns (auth, DB, logging, docs)

**Service Pattern:**
- Services are classes with methods for each operation
- Services receive a user-scoped `SupabaseClient` as a parameter
- Services throw errors; routes catch and convert to HTTP responses
- Services return plain data; routes wrap in `{ data: ... }` envelope

## Key Features & Patterns

### Type Safety
- **End-to-end TypeScript** from database to UI
- **Zod schemas** for runtime validation on server
- **TypeBox** for Fastify schema integration
- **Static type inference** from Zod schemas

### Authentication & Authorization
- **JWT-based authentication** via Supabase Auth
- **Token storage** in localStorage (client-side)
- **Row Level Security** for database-level authorization
- **User-scoped Supabase clients** via fastify-supabase plugin

### State Management
- **React Context** for authentication state (global)
- **React Query** for server state (workouts, exercises)
- **localStorage** for session persistence
- **Component state** for UI-only state

### API Design
- **RESTful endpoints** with conventional HTTP methods
- **Nested resources** for related data (workouts include exercises)
- **Swagger documentation** auto-generated from schemas
- **Consistent error responses** with `{ error: "message" }` format

### Database Patterns
- **Foreign key relationships** with cascading deletes
- **Join tables** for many-to-many (workout_exercises)
- **Timestamps** (created_at, updated_at) on all tables
- **UUID primary keys** for all entities
- **Database views** for common queries (workout_exercises_withdate)



## Environment Variables

**Server (.env in root):**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_KEY` - Service role key (server-side only)
- `SUPABASE_JWT_SECRET` - JWT verification secret
- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)

**Client (Vite env vars):**
- `VITE_API_URL` - API base URL (falls back to relative path in production)



## Testing Strategy

Currently, the application does not have automated tests. Recommended testing approach:

- **Unit tests** for service layer functions (pure logic)
- **Integration tests** for API endpoints (route → service → DB)
- **E2E tests** for critical user flows (signup, create workout, etc.)
- **Component tests** for complex UI components

## Security Considerations

1. **Row Level Security** - All database tables use RLS policies
2. **JWT verification** - All protected routes verify tokens
3. **User-scoped queries** - Supabase client is user-authenticated
4. **CORS configuration** - Configured for specific origins
5. **Environment secrets** - Sensitive keys never in client code
6. **No direct DB access** - Client always goes through API

## Performance Optimizations

1. **React Query caching** - Reduces redundant API calls
2. **Supabase connection pooling** - Efficient DB connections
3. **Static asset serving** - Fastify serves built client efficiently
4. **Vite build optimization** - Code splitting, tree shaking
5. **Database indexes** - On foreign keys and frequently queried columns



# Archive / Unorganized
## Request/Response Flow Example

**Creating a Workout:**

```
1. User fills out workout form on /record-workout page
   ↓
2. Component calls fetchApi('/workouts', { method: 'POST', body: {...} })
   ↓
3. API client adds Authorization header with JWT token
   ↓
4. Request hits Fastify server at POST /api/v1/workouts
   ↓
5. verifyAuth middleware verifies JWT token (server/src/lib/auth.ts)
   ↓
6. Supabase plugin creates user-scoped client (request.supabaseClient)
   ↓
7. Route handler delegates to WorkoutService.createWorkout()
   ↓
8. Service inserts workout into database via Supabase client
   ↓
9. RLS policies ensure workout.user_id = auth.uid()
   ↓
10. Service returns created workout data
    ↓
11. Route handler wraps in { data: workout } and sends response
    ↓
12. Client receives data, React Query updates cache
    ↓
13. UI re-renders with new workout
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     React Client (SPA)                         │
│  • Pages (Home, RecordWorkout, ViewWorkouts, EditExercises)   │
│  • UI Components (shadcn/ui + Radix)                           │
│  • React Router for navigation                                 │
└──────────────┬──────────────────┬──────────────────────────────┘
               │                  │
       State Management    HTTP Requests
               │                  │
       ┌───────▼──────┐    ┌──────▼──────────────────────────────┐
       │ AuthContext  │    │     API Client (fetchApi)           │
       │ (React       │    │  • JWT token from localStorage      │
       │  Context)    │    │  • Authorization headers            │
       └──────────────┘    │  • Error handling                   │
                           └──────┬──────────────────────────────┘
                                  │
                          HTTP/JSON over network
                                  │
┌─────────────────────────────────▼──────────────────────────────┐
│                    Fastify Server (:3001)                      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Plugins Layer                                         │   │
│  │  • CORS configuration                                  │   │
│  │  • JWT verification (@fastify/jwt)                     │   │
│  │  • Supabase client injection                           │   │
│  │  • Swagger API documentation                           │   │
│  │  • Static file serving (production)                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  Routes Layer (/api/v1)                                 │  │
│  │  • /auth (signup, login, logout)                        │  │
│  │  • /workouts (CRUD operations)                          │  │
│  │  • /exercises (CRUD operations)                         │  │
│  │  • /exercise-groups (CRUD operations)                   │  │
│  │  Middleware: verifyAuth() for protected routes          │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  Service Layer (Business Logic)                         │  │
│  │  • WorkoutService - workout CRUD with exercises         │  │
│  │  • ExerciseService - exercise management                │  │
│  │  • ExerciseGroupService - group management              │  │
│  │  Services receive user-scoped Supabase client           │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  Schema Layer (Validation)                              │  │
│  │  • Zod schemas for request/response validation          │  │
│  │  • Type generation from schemas                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                    Supabase Client SDK
                              │
┌─────────────────────────────▼──────────────────────────────────┐
│                    Supabase (PostgreSQL)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Authentication (Supabase Auth)                      │     │
│  │  • JWT token generation                              │     │
│  │  • User session management                           │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Database Tables                                     │     │
│  │  • users (auth schema)                               │     │
│  │  • exercises (user_id FK)                            │     │
│  │  • exercise_groups (user_id FK)                      │     │
│  │  • workouts (user_id FK)                             │     │
│  │  • workout_exercises (workout_id, exercise_id)       │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Row Level Security (RLS)                            │     │
│  │  • Automatic filtering by auth.uid()                 │     │
│  │  • Prevents cross-user data access                   │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment

The application is configured for deployment on **Fly.io** using the included `fly.toml` and `Dockerfile`. The deployment strategy:

1. Build client assets (`npm run build:client`)
2. Build server TypeScript (`npm run build:server`)
3. Server serves client from `client/dist` directory
4. Single Docker container runs the Fastify server
5. Environment variables injected via Fly secrets


## Development Workflow

### Local Development
```bash
npm run dev              # Start both client (5173) and server (3001)
npm run dev:client       # Start only client (Vite dev server)
npm run dev:server       # Start only server (tsx watch mode)
```

### Building & Deployment
```bash
npm run build            # Build both client and server
npm run start            # Start production server (serves client)
```

The server serves the built React app as static files in production, with a catch-all handler that returns `index.html` for client-side routing (server/src/app.ts:43-50).

### Type Checking
```bash
npm run type-check       # Check types in both workspaces
npm run type-watch       # Watch mode for development
```