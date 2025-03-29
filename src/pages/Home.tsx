
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, History, LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExerciseGroups } from "@/services/exerciseGroups";
import { useExercises } from "@/services/exercises";

const Home = () => {
  const { signOut, user } = useAuth();
  const { data: exerciseGroups, isLoading: loadingGroups } = useExerciseGroups();
  const { data: exercises, isLoading: loadingExercises } = useExercises();
  
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
          
          {loadingGroups ? (
            <p className="text-gray-400 text-sm">Loading exercise groups...</p>
          ) : exerciseGroups && exerciseGroups.length > 0 ? (
            <div className="space-y-3">
              {exerciseGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="rounded-xl border-0"
                  style={{ backgroundColor: `${group.color}30` /* Add transparency */ }}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-400">
                      {loadingExercises 
                        ? 'Loading exercises...' 
                        : exercises?.filter(e => e.group_id === group.id).length || 0} exercises
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              You don't have any exercise groups yet. Add some exercises to get started!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
