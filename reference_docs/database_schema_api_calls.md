# Database Schema

**users**
Default Supabase user model
- id: uuid

**exercise_groups**
- id: uuid
- name: str
- color: str
- num_exercises_to_show: int
- user_id: FK to id in users table
- created_at: timestampz
- updated_at: timestampz, nullable

**exercises**
- id: uuid
- name: str
- description: str
- group_id: id in exercise_grups table
- user_id: FK to id in users table
- last_performed: date, nullable
- last_dequeued: date, nullable
- created_at: timestampz
- updated_at: timestampz, nullable

**workouts**
- id: uuid
- user_id: FK to id in users table
- created_at: timestampz
- updated_at: timestampz, nullable
- notes: str, nullable


**workout_exercises**
- id: uuid
- sets: int
- workout_id: FK to id in workouts table
- exercise_id: FK to id in exercises table
- user_id: FK to id in users table
- created_at: timestampz
- updated_at: timestampz, nullable


# API Calls
- List all exercise groups
- Create exercise group
- Update exercise group
- Delete exercise group
- List all exercises
- Create exercise
- Update exercise
- Delete exercise
- List all workouts
- Create workout
