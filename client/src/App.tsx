import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import EditExercises from "./pages/EditExercises";
import RecordWorkout from "./pages/RecordWorkout";
import ViewWorkouts from "./pages/ViewWorkouts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/home" element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/edit-exercises" element={
                            <ProtectedRoute>
                                <EditExercises />
                            </ProtectedRoute>
                        } />
                        <Route path="/record-workout" element={
                            <ProtectedRoute>
                                <RecordWorkout />
                            </ProtectedRoute>
                        } />
                        <Route path="/view-workouts" element={
                            <ProtectedRoute>
                                <ViewWorkouts />
                            </ProtectedRoute>
                        } />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
