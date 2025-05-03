import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, History, Plus, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExerciseGroups } from "@/services/exerciseGroups";
import { useExercises } from "@/services/exercises";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { ExerciseGroupCard } from "@/components/ExerciseGroupCard";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: exerciseGroups, isLoading: loadingGroups } = useExerciseGroups();
  const { data: exercises, isLoading: loadingExercises } = useExercises();
  
  // Get least recently performed exercises for each group
  const groupExercises = useMemo(() => {
    if (!exerciseGroups || !exercises) return {};
    
    return exerciseGroups.reduce((acc, group) => {
      // Filter exercises for this group
      const groupExercisesList = exercises.filter(e => e.group_id === group.id);
      
      // Sort by last_performed:
      // 1. Null values first (never performed)
      // 2. Then oldest first (least recently performed)
      const sortedExercises = [...groupExercisesList].sort((a, b) => {
        // If both have never been performed, sort by name
        if (!a.last_performed && !b.last_performed) {
          return a.name.localeCompare(b.name);
        }
        
        // Prioritize exercises that have never been performed
        if (!a.last_performed) return -1; // a should come first
        if (!b.last_performed) return 1;  // b should come first
        
        // Both have been performed, sort by date (oldest first)
        return new Date(parseISO(a.last_performed)).getTime() - new Date(parseISO(b.last_performed)).getTime();
      });
      
      // Limit to num_exercises_to_show
      acc[group.id] = sortedExercises.slice(0, group.num_exercises_to_show || 2);
      return acc;
    }, {});
  }, [exerciseGroups, exercises]);
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header showLogout={true} />

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Link to="/record-workout">
              <Card className="bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
                <CardContent className="p-6 flex items-center">
                  <Plus className="h-5 w-5 mr-3 text-purple-500" />
                  <span>Record Workout</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/edit-exercises">
              <Card className="bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
                <CardContent className="p-6 flex items-center">
                  <Pencil className="h-5 w-5 mr-3 text-purple-500" />
                  <span>Edit Exercises</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/view-workouts">
              <Card className="bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
                <CardContent className="p-6 flex items-center">
                  <History className="h-5 w-5 mr-3 text-purple-500" />
                  <span>View Workouts</span>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">Focus Exercises</h2>
          
          {loadingGroups ? (
            <p className="text-zinc-400 text-sm">Loading exercise groups...</p>
          ) : exerciseGroups && exerciseGroups.length > 0 ? (
            <div className="space-y-3">
              {exerciseGroups.map((group) => (
                <ExerciseGroupCard
                  key={group.id}
                  group={group}
                  exercises={groupExercises[group.id] || []}
                  maxExercises={group.num_exercises_to_show}
                  renderExerciseSecondaryText={(exercise) => 
                    exercise.last_performed
                      ? `${format(parseISO(exercise.last_performed), 'MMM d, yyyy')}`
                      : 'Never performed'
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">
              You don't have any exercise groups yet. Add some exercises to get started!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
