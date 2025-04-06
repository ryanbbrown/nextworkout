
-- Create view joining workout_exercises with workouts to include workout_date
CREATE OR REPLACE VIEW workout_exercises_withdate AS
SELECT
  we.id,
  we.workout_id,
  we.exercise_id,
  we.sets,
  we.user_id,
  we.created_at,
  we.updated_at,
  w.workout_date
FROM
  workout_exercises we
JOIN
  workouts w ON we.workout_id = w.id;
