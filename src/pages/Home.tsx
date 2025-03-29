
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, History, LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { signOut, user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold">NextWorkout</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="text-gray-400 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Link to="/add-exercises">
              <Card className="bg-gray-800 border-0 rounded-xl hover:bg-gray-700 transition-colors">
                <CardContent className="p-6 flex items-center">
                  <Plus className="h-5 w-5 mr-3 text-purple-500" />
                  <span>Add Exercises</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/record-workout">
              <Card className="bg-gray-800 border-0 rounded-xl hover:bg-gray-700 transition-colors">
                <CardContent className="p-6 flex items-center">
                  <Dumbbell className="h-5 w-5 mr-3 text-purple-500" />
                  <span>Record Workout</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/view-workouts">
              <Card className="bg-gray-800 border-0 rounded-xl hover:bg-gray-700 transition-colors">
                <CardContent className="p-6 flex items-center">
                  <History className="h-5 w-5 mr-3 text-purple-500" />
                  <span>View Workouts</span>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">Recent Exercise Groups</h2>
          <p className="text-gray-400 text-sm">
            You don't have any exercise groups yet. Add some exercises to get started!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
