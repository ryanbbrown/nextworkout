import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const USER_ID = "54f12838-5340-4673-bc08-7c0d2c44a84a";

async function exportData() {
  const { data: exerciseGroups, error: e1 } = await supabase
    .from("exercise_groups")
    .select("*")
    .eq("user_id", USER_ID)
    .order("id");

  const { data: exercises, error: e2 } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", USER_ID)
    .order("name");

  const { data: workouts, error: e3 } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", USER_ID)
    .order("workout_date", { ascending: false });

  const { data: workoutExercises, error: e4 } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("user_id", USER_ID)
    .order("id");

  const errors = [e1, e2, e3, e4].filter(Boolean);
  if (errors.length > 0) {
    console.error("Errors fetching data:", errors);
    process.exit(1);
  }

  const output = {
    exercise_groups: exerciseGroups,
    exercises: exercises,
    workouts: workouts,
    workout_exercises: workoutExercises,
  };

  writeFileSync("seed.json", JSON.stringify(output, null, 2));
  console.log(
    `Exported: ${exerciseGroups?.length} groups, ${exercises?.length} exercises, ${workouts?.length} workouts, ${workoutExercises?.length} workout exercises`
  );
}

exportData();
