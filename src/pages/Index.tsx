
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  // If user is already logged in, redirect to home
  if (user && !isLoading) {
    return <Navigate to="/home" replace />;
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">NextWorkout.io</h1>
        <p className="text-zinc-400">
          Find your optimal next workout, for the not-so-consistent athlete
        </p>
        <Button 
          className="w-full py-6 text-lg rounded-xl bg-purple-600 hover:bg-purple-700" 
          asChild
        >
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
