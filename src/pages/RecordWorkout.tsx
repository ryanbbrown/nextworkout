
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExerciseGroups } from "@/services/exerciseGroups";
import { useExercisesByGroup, Exercise } from "@/services/exercises";
import { useCreateWorkout } from "@/services/workouts";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const RecordWorkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Data fetching
  const { data: exerciseGroups, isLoading: loadingGroups } = useExerciseGroups();
  
  // State for tracking selected exercises and notes
  const [selectedExercises, setSelectedExercises] = useState<{
    id: string;
    name: string;
    sets: number;
    details: string;
  }[]>([]);
  const [notes, setNotes] = useState<string>("");
  
  // Mutations
  const createWorkoutMutation = useCreateWorkout();

  // Add exercise to workout
  const addExerciseToWorkout = (exercise: { id: string; name: string; description: string }) => {
    setSelectedExercises(prev => {
      const existing = prev.find(e => e.id === exercise.id);
      if (existing) {
        return prev.map(e => 
          e.id === exercise.id ? { ...e, sets: e.sets + 1 } : e
        );
      } else {
        return [...prev, { id: exercise.id, name: exercise.name, sets: 1, details: "" }];
      }
    });
  };

  // Remove set or exercise
  const removeSetOrExercise = (exerciseId: string) => {
    setSelectedExercises(prev => {
      const exercise = prev.find(e => e.id === exerciseId);
      if (exercise && exercise.sets > 1) {
        return prev.map(e => 
          e.id === exerciseId ? { ...e, sets: e.sets - 1 } : e
        );
      } else {
        return prev.filter(e => e.id !== exerciseId);
      }
    });
  };
  
  // Update exercise details
  const updateExerciseDetails = (exerciseId: string, details: string) => {
    setSelectedExercises(prev => 
      prev.map(e => e.id === exerciseId ? { ...e, details } : e)
    );
  };
  
  // Save workout
  const handleSaveWorkout = () => {
    if (selectedExercises.length === 0) {
      toast({ 
        title: "Error", 
        description: "Please select at least one exercise for your workout", 
        variant: "destructive" 
      });
      return;
    }
    
    // Format exercises for saving
    const workoutExercises = selectedExercises.map(exercise => ({
      exercise_id: exercise.id,
      sets: exercise.sets,
      details: exercise.details,
      user_id: user?.id || ''
    }));
    
    // Create the workout
    createWorkoutMutation.mutate({
      workout: {
        user_id: user?.id || '',
        notes: notes.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: null
      },
      workoutExercises
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Workout recorded successfully" });
        navigate('/home');
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center">
        <Link to="/home" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Record Workout</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* This Workout Section */}
        <Card className="rounded-xl border-0 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">This Workout</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedExercises.length === 0 ? (
              <p className="text-sm text-gray-400">Select exercises below to add to your workout</p>
            ) : (
              <div className="space-y-2">
                {selectedExercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center cursor-pointer mb-2" 
                         onClick={() => removeSetOrExercise(exercise.id)}>
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="text-sm text-gray-400">
                        {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Notes about this exercise (optional)"
                      className="text-xs bg-gray-800 border-gray-700"
                      value={exercise.details}
                      onChange={(e) => updateExerciseDetails(exercise.id, e.target.value)}
                    />
                  </div>
                ))}

                <Textarea
                  placeholder="Workout notes (optional)"
                  className="w-full mt-4 bg-gray-700 border-gray-600"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Button 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveWorkout}
                  disabled={createWorkoutMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {createWorkoutMutation.isPending ? "Saving..." : "Record Workout"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Groups */}
        {loadingGroups ? (
          <p className="text-gray-400 text-center">Loading exercise groups...</p>
        ) : (
          <div className="space-y-4">
            {exerciseGroups?.map((group) => {
              // Get exercises for this group using the hook
              const { data: exercises } = useExercisesByGroup(group.id);
              
              return (
                <Card 
                  key={group.id} 
                  className="rounded-xl border-0"
                  style={{ backgroundColor: `${group.color}30` /* Add transparency */ }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {exercises && exercises.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {exercises.map((exercise) => (
                          <Button
                            key={exercise.id}
                            variant="outline"
                            className="flex flex-col items-start h-20 text-left bg-gray-800 hover:bg-gray-700 border-0 rounded-lg p-3"
                            onClick={() => addExerciseToWorkout(exercise)}
                          >
                            <h3 className="font-medium text-sm">{exercise.name}</h3>
                            <p className="text-xs text-gray-400">{exercise.description}</p>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No exercises in this group yet</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecordWorkout;
