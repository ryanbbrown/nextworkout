/// <reference types="vite/client" />

interface Env {
    VITE_API_URL: string;
}

// Type-safe environment variables
export const env: Env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
}; 