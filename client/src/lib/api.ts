import { env } from '@/env';

// Determine API base URL based on environment
const getApiBase = () => {
  // Check if we're running locally vs production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // If we're running locally, use the local API
    if (isLocal) {
      return env.VITE_API_URL || 'http://localhost:3001/api/v1';
    }
    
    // If we're in production and VITE_API_URL is set to a production URL, use it
    if (env.VITE_API_URL && !env.VITE_API_URL.includes('localhost') && !env.VITE_API_URL.includes('127.0.0.1')) {
      return env.VITE_API_URL;
    }
  }
  
  // Default to relative path for production
  return '/api/v1';
};

export const API_BASE = getApiBase();

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

    // Get the JWT token from localStorage (where AuthContext stores it)
    const token = localStorage.getItem('access_token');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
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

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        created_at: string;
    };
    session: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
    };
}

export interface MessageResponse {
    message: string;
}

export const authApi = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },

    async signup(email: string, password: string): Promise<MessageResponse> {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        return response.json();
    },

    async logout(): Promise<MessageResponse> {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Logout failed');
        }

        return response.json();
    },
}; 