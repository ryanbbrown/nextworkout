
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkouts } from "@/services/workouts";
import { format } from "date-fns";

const ViewWorkouts = () => {
  const { data: workouts, isLoading } = useWorkouts();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center">
        <Link to="/home" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Workout History</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading your workout history...</p>
        ) : workouts && workouts.length > 0 ? (
          workouts.map((workout) => (
            <Card 
              key={workout.id} 
              className="rounded-xl border-0 bg-gray-800"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {format(new Date(workout.created_at), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workout.workout_exercises?.map((workoutExercise, index) => (
                    <li 
                      key={index}
                      className="flex justify-between items-center text-sm py-2 border-b border-gray-700 last:border-0"
                    >
                      <span>{workoutExercise.exercise?.name}</span>
                      <span className="text-gray-400">
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
            <p className="text-gray-400">You haven't recorded any workouts yet</p>
            <Link 
              to="/record-workout" 
              className="text-purple-500 hover:text-purple-400 inline-block mt-2"
            >
              Record your first workout
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewWorkouts;
