
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Dumbbell, Clock, BarChart } from "lucide-react";

const Index = () => {
    const { user, isLoading } = useAuth();

    // If user is already logged in, redirect to home
    if (user && !isLoading) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            <header className="p-4 flex items-center">
                <div className="flex items-center gap-2">
                    <img
                        src="/calendar.png"
                        alt="NextWorkout Logo"
                        className="h-8 w-8"
                    />
                    <h1 className="text-2xl font-bold">NextWorkout</h1>
                </div>
            </header>

            <main className="flex-1 px-4 flex flex-col items-center">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="space-y-4 mt-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                            Smarter Workouts
                        </h1>
                        <p className="text-zinc-400 text-lg mx-auto">
                            For the not-so-consistent athlete
                        </p>

                        <Button
                            className="w-3/4 py-5 mt-6 text-lg rounded-xl bg-purple-700 hover:bg-purple-800 text-white"
                            asChild
                        >
                            <Link to="/auth">Get Started</Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-8 pt-8">
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-purple-900/30 p-3 mb-3">
                                <Dumbbell className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-lg">Track Your Exercises</h3>
                            <p className="text-zinc-400 text-sm mx-auto w-3/5">
                                Organize your exercises into customizable groups
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-blue-900/30 p-3 mb-3">
                                <Clock className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-lg">Optimized Suggestions</h3>
                            <p className="text-zinc-400 text-sm mx-auto w-3/5">
                                Focus on exercises you haven't done in a while
                            </p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-teal-900/30 p-3 mb-3">
                                <BarChart className="h-6 w-6 text-teal-400" />
                            </div>
                            <h3 className="font-semibold text-lg">Track Progress</h3>
                            <p className="text-zinc-400 text-sm mx-auto w-3/5">
                                View your workout history and progress over time
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="p-4 text-center text-zinc-500 text-xs">
                <p>NextWorkout - Find your optimal next workout</p>
            </footer>
        </div>
    );
};

export default Index;
