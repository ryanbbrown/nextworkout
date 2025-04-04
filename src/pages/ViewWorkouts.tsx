import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  useWorkouts, 
  useUpdateWorkout, 
  useDeleteWorkout,
  useAddExerciseToWorkout,
  WorkoutExercise 
} from "@/services/workouts";
import { useExercises, Exercise } from "@/services/exercises";
import { format, parseISO } from "date-fns";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ViewWorkouts = () => {
  const { data: workouts, isLoading } = useWorkouts();
  const { data: exercises } = useExercises();
  const updateWorkoutMutation = useUpdateWorkout();
  const deleteWorkoutMutation = useDeleteWorkout();
  const addExerciseMutation = useAddExerciseToWorkout();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [exerciseUpdates, setExerciseUpdates] = useState<{ id: string, sets: number }[]>([]);
  const [exercisesToRemove, setExercisesToRemove] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [newExerciseSets, setNewExerciseSets] = useState<number>(3);
  
  const [tempNewExercises, setTempNewExercises] = useState<{
    id: string;
    exercise_id: string;
    sets: number;
    exercise?: Exercise;
  }[]>([]);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditWorkout = (workout: any) => {
    setSelectedWorkout(workout);
    setSelectedDate(parseISO(workout.workout_date));
    
    setExercisesToRemove([]);
    setSelectedExerciseId("");
    setNewExerciseSets(3);
    setTempNewExercises([]);
    
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

  const handleSaveWorkout = async () => {
    try {
      await updateWorkoutMutation.mutateAsync({
        workoutId: selectedWorkout.id,
        newDate: selectedDate,
        exerciseUpdates: exerciseUpdates.filter(ex => !exercisesToRemove.includes(ex.id)),
        exercisesToRemove
      });
      
      if (tempNewExercises.length > 0) {
        for (const exercise of tempNewExercises) {
          await addExerciseMutation.mutateAsync({
            workoutId: selectedWorkout.id,
            exerciseId: exercise.exercise_id,
            sets: exercise.sets,
            userId: user?.id
          });
        }
      }
      
      setIsEditDialogOpen(false);
      setTempNewExercises([]);
      
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

  const handleSetsChange = (exerciseId: string, newSets: number) => {
    if (newSets === 0) {
      setExercisesToRemove(prev => 
        prev.includes(exerciseId) ? prev : [...prev, exerciseId]
      );
    } else {
      setExercisesToRemove(prev => prev.filter(id => id !== exerciseId));
    }
    
    setExerciseUpdates(prev => 
      prev.map(ex => ex.id === exerciseId ? { ...ex, sets: newSets } : ex)
    );
  };
  
  const handleAddExercise = () => {
    if (!selectedExerciseId || newExerciseSets <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select an exercise and enter a valid number of sets.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedExercise = exercises?.find(ex => ex.id === selectedExerciseId);
    if (!selectedExercise) return;
    
    const tempId = `temp-${Date.now()}`;
    
    const newTempExercise = {
      id: tempId,
      exercise_id: selectedExerciseId,
      sets: newExerciseSets,
      exercise: selectedExercise
    };
    
    setTempNewExercises(prev => [...prev, newTempExercise]);
    
    setSelectedExerciseId("");
    setNewExerciseSets(3);
    
    toast({
      title: "Exercise added",
      description: "The exercise has been added to your workout. Click Save Changes to confirm.",
    });
  };
  
  const handleDeleteWorkout = async () => {
    try {
      await deleteWorkoutMutation.mutateAsync(selectedWorkout.id);
      
      setIsDeleteDialogOpen(false);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Workout deleted",
        description: "Your workout has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout.",
        variant: "destructive",
      });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const getAvailableExercises = () => {
    if (!exercises) return [];
    
    return exercises.filter(exercise => 
      !selectedWorkout?.workout_exercises?.some(
        (we: WorkoutExercise) => we.exercise_id === exercise.id && !exercisesToRemove.includes(we.id)
      ) &&
      !tempNewExercises.some(te => te.exercise_id === exercise.id)
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
                  {format(parseISO(workout.workout_date), 'EEEE, MMMM d, yyyy')}
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
                <ul className="space-y-1">
                  {workout.workout_exercises?.map((workoutExercise, index) => (
                    <li 
                      key={index}
                      className="flex justify-between items-center text-sm py-1 border-b border-zinc-800 last:border-0"
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-foreground w-[95%] max-w-lg mx-auto rounded-xl">
          <ScrollArea className="max-h-[80vh] overflow-y-auto pr-4">
            <DialogHeader>
              <DialogTitle>Edit Workout</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Edit the date, exercises, or sets for this workout.
              </DialogDescription>
            </DialogHeader>

            {selectedWorkout && (
              <div className="space-y-4">
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Exercise Sets</label>
                  </div>
                  
                  {selectedWorkout.workout_exercises?.map((ex: WorkoutExercise, index: number) => (
                    <div 
                      key={ex.id} 
                      className={`flex items-center justify-between p-1.5 rounded-md ${
                        exercisesToRemove.includes(ex.id) ? 'bg-red-900/20 border border-red-900/40' : ''
                      }`}
                    >
                      <span className="text-sm">
                        {ex.exercise?.name}
                        {exercisesToRemove.includes(ex.id) && (
                          <span className="text-xs ml-2 text-red-400">(Will be removed)</span>
                        )}
                      </span>
                      <Input
                        type="number"
                        value={exercisesToRemove.includes(ex.id) ? 0 : (exerciseUpdates.find(update => update.id === ex.id)?.sets || ex.sets)}
                        onChange={(e) => handleSetsChange(ex.id, parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20 bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  ))}
                  
                  {tempNewExercises.map((ex) => (
                    <div 
                      key={ex.id} 
                      className="flex items-center justify-between p-1.5 rounded-md bg-purple-900/20 border border-purple-900/40"
                    >
                      <span className="text-sm">
                        {ex.exercise?.name}
                        <span className="text-xs ml-2 text-purple-400">(New)</span>
                      </span>
                      <Input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => {
                          const newSets = parseInt(e.target.value) || 0;
                          setTempNewExercises(prev => 
                            prev.map(item => item.id === ex.id ? {...item, sets: newSets} : item)
                          );
                        }}
                        min="1"
                        className="w-20 bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  ))}

                  <div className="pt-3 border-t border-zinc-800 mt-3">
                    <h4 className="text-sm font-medium mb-1.5">Add Exercise</h4>
                    <div className="flex flex-col space-y-2">
                      <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Select an exercise" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {getAvailableExercises().map((exercise: Exercise) => (
                            <SelectItem key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          value={newExerciseSets}
                          onChange={(e) => setNewExerciseSets(parseInt(e.target.value) || 0)}
                          min="1"
                          placeholder="Sets"
                          className="w-24 bg-zinc-800 border-zinc-700"
                        />
                        <Button 
                          onClick={handleAddExercise}
                          disabled={!selectedExerciseId || newExerciseSets <= 0}
                          className="bg-purple-700 hover:bg-purple-800"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col mt-4 space-y-2">
              <Button 
                onClick={handleSaveWorkout}
                disabled={updateWorkoutMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full h-10"
              >
                {updateWorkoutMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="bg-red-900 hover:bg-red-800 w-full h-10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Workout
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Delete Workout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete this workout? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              onClick={handleCancelDelete}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkout}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewWorkouts;
