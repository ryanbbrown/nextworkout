
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, History, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  // Mock data for exercise groups - this will come from the database later
  const exerciseGroups = [
    {
      id: "1",
      name: "Upper Body",
      color: "#9333ea", // Purple
      numExercisesToShow: 2,
      exercises: [
        { id: "1", name: "Push-ups", description: "3x10", lastPerformed: "2023-09-15" },
        { id: "2", name: "Pull-ups", description: "3x8", lastPerformed: "2023-09-10" },
      ]
    },
    {
      id: "2",
      name: "Lower Body",
      color: "#2563eb", // Blue
      numExercisesToShow: 2,
      exercises: [
        { id: "3", name: "Squats", description: "3x12", lastPerformed: "2023-09-18" },
        { id: "4", name: "Lunges", description: "3x10 each leg", lastPerformed: "2023-09-05" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">NextWorkout.io</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            className="flex flex-col items-center justify-center h-24 bg-gray-800 hover:bg-gray-700 rounded-xl"
            asChild
          >
            <Link to="/add-exercises">
              <Plus className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Exercises</span>
            </Link>
          </Button>
          
          <Button 
            className="flex flex-col items-center justify-center h-24 bg-gray-800 hover:bg-gray-700 rounded-xl"
            asChild
          >
            <Link to="/record-workout">
              <Dumbbell className="h-6 w-6 mb-2" />
              <span className="text-sm">Record Workout</span>
            </Link>
          </Button>
          
          <Button 
            className="flex flex-col items-center justify-center h-24 bg-gray-800 hover:bg-gray-700 rounded-xl"
            asChild
          >
            <Link to="/view-workouts">
              <History className="h-6 w-6 mb-2" />
              <span className="text-sm">View Workouts</span>
            </Link>
          </Button>
        </div>

        {/* Next Exercises */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Next Exercises</h2>
          
          {exerciseGroups.map((group) => (
            <Card 
              key={group.id} 
              className="rounded-xl border-0"
              style={{ backgroundColor: `${group.color}30` /* Add transparency */ }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{group.name}</span>
                  <span className="text-sm font-normal text-gray-400">Show {group.numExercisesToShow}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.exercises.map((exercise) => (
                    <div 
                      key={exercise.id}
                      className="p-3 bg-gray-800 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-sm text-gray-400">{exercise.description}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last: {new Date(exercise.lastPerformed).toLocaleDateString()}
                      </div>
                    </div>
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

export default Home;
