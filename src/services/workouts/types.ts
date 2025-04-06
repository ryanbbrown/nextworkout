
import { Exercise } from '../exercises';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  exercise?: Exercise;
  workout_date?: string; // Added from the view
}

export interface Workout {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  notes: string | null;
  workout_date: string; // New field for the workout date
  workout_exercises?: WorkoutExercise[];
}
