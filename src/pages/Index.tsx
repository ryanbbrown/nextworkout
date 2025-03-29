
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">NextWorkout.io</h1>
        <p className="text-gray-400">
          Find your optimal next workout, for the not-so-consistent athlete
        </p>
        <Button 
          className="w-full py-6 text-lg rounded-xl bg-purple-600 hover:bg-purple-700" 
          asChild
        >
          <Link to="/home">Log in</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
