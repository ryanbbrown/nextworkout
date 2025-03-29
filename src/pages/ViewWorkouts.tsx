
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ViewWorkouts = () => {
  // Mock workout history data
  const workouts = [
    {
      id: "1",
      date: "2023-10-15",
      exercises: [
        { name: "Push-ups", sets: 3, details: "3x10" },
        { name: "Pull-ups", sets: 2, details: "3x8" },
        { name: "Squats", sets: 3, details: "3x12" },
      ]
    },
    {
      id: "2",
      date: "2023-10-12",
      exercises: [
        { name: "Lunges", sets: 3, details: "3x10 each leg" },
        { name: "Shoulder Press", sets: 3, details: "3x12" },
      ]
    },
    {
      id: "3",
      date: "2023-10-08",
      exercises: [
        { name: "Push-ups", sets: 3, details: "3x10" },
        { name: "Pull-ups", sets: 3, details: "3x8" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center">
        <Link to="/home" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Workout History</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {workouts.map((workout) => (
          <Card 
            key={workout.id} 
            className="rounded-xl border-0 bg-gray-800"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {new Date(workout.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {workout.exercises.map((exercise, index) => (
                  <li 
                    key={index}
                    className="flex justify-between items-center text-sm py-2 border-b border-gray-700 last:border-0"
                  >
                    <span>{exercise.name}</span>
                    <span className="text-gray-400">{exercise.sets} sets</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default ViewWorkouts;
