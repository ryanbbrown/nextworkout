
-- Function to update last_performed date for exercises
CREATE OR REPLACE FUNCTION update_exercise_last_performed() RETURNS TRIGGER AS $$
BEGIN
  -- Update last_performed for the affected exercise(s)
  UPDATE exercises e
  SET last_performed = (
    SELECT MAX(wed.workout_date)
    FROM workout_exercises_withdate wed
    WHERE wed.exercise_id = e.id
    AND wed.user_id = e.user_id
  )

  -- Update for the relevant exercise_id and user_id
  -- NEW = NULL for DELETE bc result of operation is to get rid of the record
  WHERE e.id = (
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.exercise_id
      ELSE NEW.exercise_id
    END
  )
  AND e.user_id = (
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.user_id
      ELSE NEW.user_id
    END
  );

  -- These return values are formality bc the trigger is AFTER
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on workout_exercises
DROP TRIGGER IF EXISTS update_exercise_last_performed_trigger ON workout_exercises;
CREATE TRIGGER update_exercise_last_performed_trigger
AFTER INSERT OR UPDATE OR DELETE ON workout_exercises
FOR EACH ROW
EXECUTE FUNCTION update_exercise_last_performed();
