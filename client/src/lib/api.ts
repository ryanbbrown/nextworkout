import { env } from '@/env';
import { supabase } from './supabase';

export const API_BASE = env.VITE_API_URL || 'http://localhost:3001/api/v1';

export class APIError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers = new Headers(options.headers);

    // Only set Content-Type for requests that have a body
    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    // Get the current session and add the JWT token to headers
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new APIError(response.status, data.error || 'An error occurred');
    }

    return data;
} 