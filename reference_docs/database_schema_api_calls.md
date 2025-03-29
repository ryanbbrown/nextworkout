# Database Schema

**User**

This can be the default Supabase user model

- user_id
- name
- username
- password?

**ExerciseGroup**

- group_id
- Name: str
- Color: str
- num_exercises_to_show: int = 2
- user_id: links to User

**Exercise**

- exercise_id
- Name: str
- Description: str
- group_id: links to ExerciseGroup
- user_id: links to User
- last_performed: date, nullable
- last_dequeued: date, nullable

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
