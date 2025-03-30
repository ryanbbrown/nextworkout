
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkouts, useUpdateWorkout, WorkoutExercise } from "@/services/workouts";
import { format, parse } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const ViewWorkouts = () => {
  const { data: workouts, isLoading } = useWorkouts();
  const updateWorkoutMutation = useUpdateWorkout();
  const { toast } = useToast();
  
  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [exerciseUpdates, setExerciseUpdates] = useState<{ id: string, sets: number }[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Handle opening edit dialog
  const handleEditWorkout = (workout: any) => {
    setSelectedWorkout(workout);
    setSelectedDate(new Date(workout.created_at));
    
    // Initialize exercise updates with current values
    if (workout.workout_exercises) {
      setExerciseUpdates(
        workout.workout_exercises.map((ex: WorkoutExercise) => ({
          id: ex.id,
          sets: ex.sets
        }))
      );
    }
    
    setIsEditDialogOpen(true);
  };

  // Handle saving workout changes
  const handleSaveWorkout = async () => {
    try {
      await updateWorkoutMutation.mutateAsync({
        workoutId: selectedWorkout.id,
        newDate: selectedDate,
        exerciseUpdates
      });
      
      setIsEditDialogOpen(false);
      toast({
        title: "Workout updated",
        description: "Your workout has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: "Failed to update workout.",
        variant: "destructive",
      });
    }
  };

  // Handle exercise sets change
  const handleSetsChange = (exerciseId: string, newSets: number) => {
    setExerciseUpdates(prev => 
      prev.map(ex => ex.id === exerciseId ? { ...ex, sets: newSets } : ex)
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col">
      <header className="p-4 border-b border-zinc-800 flex items-center">
        <Link to="/home" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Workout History</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {isLoading ? (
          <p className="text-zinc-400 text-center">Loading your workout history...</p>
        ) : workouts && workouts.length > 0 ? (
          workouts.map((workout) => (
            <Card 
              key={workout.id} 
              className="rounded-xl border border-zinc-800 bg-zinc-900"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {format(new Date(workout.created_at), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEditWorkout(workout)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workout.workout_exercises?.map((workoutExercise, index) => (
                    <li 
                      key={index}
                      className="flex justify-between items-center text-sm py-2 border-b border-zinc-800 last:border-0"
                    >
                      <span>{workoutExercise.exercise?.name}</span>
                      <span className="text-zinc-400">
                        {workoutExercise.sets} {workoutExercise.sets === 1 ? 'set' : 'sets'}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-zinc-400">You haven't recorded any workouts yet</p>
            <Link 
              to="/record-workout" 
              className="text-purple-500 hover:text-purple-400 inline-block mt-2"
            >
              Record your first workout
            </Link>
          </div>
        )}
      </main>

      {/* Edit Workout Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workout</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Edit the date or number of sets for this workout.
            </DialogDescription>
          </DialogHeader>

          {selectedWorkout && (
            <div className="space-y-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Workout Date</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-zinc-700 bg-zinc-800"
                    >
                      {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border border-zinc-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Exercise Sets Inputs */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Exercise Sets</label>
                {selectedWorkout.workout_exercises?.map((ex: WorkoutExercise) => (
                  <div key={ex.id} className="flex items-center justify-between">
                    <span className="text-sm">{ex.exercise?.name}</span>
                    <Input
                      type="number"
                      value={exerciseUpdates.find(update => update.id === ex.id)?.sets || ex.sets}
                      onChange={(e) => handleSetsChange(ex.id, parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-20 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveWorkout}
              disabled={updateWorkoutMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updateWorkoutMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewWorkouts;
