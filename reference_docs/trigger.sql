create or replace function update_last_performed() RETURNS TRIGGER as $$
BEGIN
    -- Update last_performed on exercises for all exercises in this workout
    UPDATE exercises e
    SET last_performed = NEW.workout_date
    FROM workout_exercises we
    WHERE we.workout_id = NEW.id
    AND we.exercise_id = e.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create or replace trigger update_last_performed_trigger
    AFTER INSERT OR UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_last_performed();