
import { useState, useEffect } from 'react';
import { ExerciseGroup } from '@/services/exerciseGroups';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/services/exercises';

// Custom hook to fetch exercises for all groups
export function useExercisesForGroups(groups: ExerciseGroup[] | undefined) {
  const [exercisesByGroupId, setExercisesByGroupId] = useState<Record<string, Exercise[]>>({});
  const [loading, setLoading] = useState(true);

  // Update exercises when groups change
  useEffect(() => {
    const fetchExercises = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }

      const exercisesMap: Record<string, Exercise[]> = {};
      
      try {
        // Fetch all exercises at once, then organize by group
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .in('group_id', groups.map(group => group.id))
          .order('name');
          
        if (error) {
          console.error('Error fetching exercises:', error);
          setLoading(false);
          return;
        }
        
        // Organize exercises by group ID
        const exercises = data as Exercise[];
        
        // Initialize empty arrays for all groups
        groups.forEach(group => {
          exercisesMap[group.id] = [];
        });
        
        // Fill in exercises for each group
        exercises.forEach(exercise => {
          if (exercisesMap[exercise.group_id]) {
            exercisesMap[exercise.group_id].push(exercise);
          }
        });
        
        setExercisesByGroupId(exercisesMap);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchExercises();
  }, [groups]);

  return { exercisesByGroupId, loading };
}
