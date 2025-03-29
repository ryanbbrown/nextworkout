
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";

const RecordWorkout = () => {
  // Mock data for exercise groups
  const exerciseGroups = [
    {
      id: "1",
      name: "Upper Body",
      color: "#9333ea", // Purple
      exercises: [
        { id: "1", name: "Push-ups", details: "3x10" },
        { id: "2", name: "Pull-ups", details: "3x8" },
        { id: "3", name: "Shoulder Press", details: "3x12" },
      ]
    },
    {
      id: "2",
      name: "Lower Body",
      color: "#2563eb", // Blue
      exercises: [
        { id: "4", name: "Squats", details: "3x12" },
        { id: "5", name: "Lunges", details: "3x10 each leg" },
      ]
    }
  ];

  // State to track selected exercises and their sets
  const [selectedExercises, setSelectedExercises] = useState<{
    id: string;
    name: string;
    sets: number;
    details: string;
  }[]>([]);

  // Add exercise to workout
  const addExerciseToWorkout = (exercise: { id: string; name: string; details: string }) => {
    setSelectedExercises(prev => {
      const existing = prev.find(e => e.id === exercise.id);
      if (existing) {
        return prev.map(e => 
          e.id === exercise.id ? { ...e, sets: e.sets + 1 } : e
        );
      } else {
        return [...prev, { ...exercise, sets: 1 }];
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
                    className="p-3 bg-gray-700 rounded-lg flex justify-between items-center"
                    onClick={() => removeSetOrExercise(exercise.id)}
                  >
                    <div>
                      <h3 className="font-medium">{exercise.name}</h3>
                      <p className="text-xs text-gray-400">{exercise.details}</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
                    </div>
                  </div>
                ))}

                {selectedExercises.length > 0 && (
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link to="/home">
                      <Check className="h-4 w-4 mr-2" />
                      Record Workout
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Groups */}
        <div className="space-y-4">
          {exerciseGroups.map((group) => (
            <Card 
              key={group.id} 
              className="rounded-xl border-0"
              style={{ backgroundColor: `${group.color}30` /* Add transparency */ }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {group.exercises.map((exercise) => (
                    <Button
                      key={exercise.id}
                      variant="outline"
                      className="flex flex-col items-start h-20 text-left bg-gray-800 hover:bg-gray-700 border-0 rounded-lg p-3"
                      onClick={() => addExerciseToWorkout(exercise)}
                    >
                      <h3 className="font-medium text-sm">{exercise.name}</h3>
                      <p className="text-xs text-gray-400">{exercise.details}</p>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RecordWorkout;
