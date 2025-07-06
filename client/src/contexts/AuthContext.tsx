import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { authApi, AuthResponse } from '@/lib/api'

interface User {
    id: string;
    email: string;
    created_at: string;
}

interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

interface AuthContextType {
    user: User | null
    session: Session | null
    isLoading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        // Check for existing session in localStorage
        const savedUser = localStorage.getItem('user')
        const savedSession = localStorage.getItem('session')
        
        if (savedUser && savedSession) {
            try {
                const parsedUser = JSON.parse(savedUser)
                const parsedSession = JSON.parse(savedSession)
                
                // Check if session is still valid (not expired)
                const now = Math.floor(Date.now() / 1000)
                const sessionExpiry = parsedSession.expires_at || 0
                
                if (sessionExpiry > now) {
                    setUser(parsedUser)
                    setSession(parsedSession)
                }
            } catch (error) {
                // Clear invalid data
                localStorage.removeItem('user')
                localStorage.removeItem('session')
            }
        }
        
        setIsLoading(false)
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response: AuthResponse = await authApi.login(email, password)

            const sessionWithExpiry = {
                ...response.session,
                expires_at: Math.floor(Date.now() / 1000) + response.session.expires_in
            }

            // Store in state
            setUser(response.user)
            setSession(sessionWithExpiry)

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(response.user))
            localStorage.setItem('session', JSON.stringify(sessionWithExpiry))
            localStorage.setItem('access_token', response.session.access_token)

            toast({
                title: "Signed in successfully",
                description: "Welcome back!",
            })
        } catch (error) {
            toast({
                title: "Sign in failed",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            })
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const signUp = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await authApi.signup(email, password)

            toast({
                title: "Account created",
                description: response.message,
            })
        } catch (error) {
            toast({
                title: "Sign up failed",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive"
            })
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setIsLoading(true)
            await authApi.logout()
            
            // Clear state
            setUser(null)
            setSession(null)
            
            // Clear localStorage
            localStorage.removeItem('user')
            localStorage.removeItem('session')
            localStorage.removeItem('access_token')
            
            toast({
                title: "Signed out successfully",
            })
        } catch (error) {
            // Even if logout fails on the server, we should clear local state
            setUser(null)
            setSession(null)
            localStorage.removeItem('user')
            localStorage.removeItem('session')
            localStorage.removeItem('access_token')
            
            toast({
                title: "Signed out successfully",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
