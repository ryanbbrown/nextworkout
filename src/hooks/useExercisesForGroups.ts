
import { useState, useEffect } from 'react';
import { useExercisesByGroup } from '@/services/exercises';
import { ExerciseGroup } from '@/services/exerciseGroups';

// Custom hook to fetch exercises for all groups
export function useExercisesForGroups(groups: ExerciseGroup[] | undefined) {
  const [exercisesByGroupId, setExercisesByGroupId] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Update exercises when groups change
  useEffect(() => {
    const fetchExercises = async () => {
      if (!groups || groups.length === 0) {
        setLoading(false);
        return;
      }

      const exercisesMap: Record<string, any> = {};
      let allFetched = true;

      // We need to individually fetch each group's exercises
      for (const group of groups) {
        try {
          const result = await fetch(`/api/exercises?group_id=${group.id}`);
          const data = await result.json();
          exercisesMap[group.id] = data;
        } catch (error) {
          console.error(`Error fetching exercises for group ${group.id}:`, error);
          exercisesMap[group.id] = [];
          allFetched = false;
        }
      }

      setExercisesByGroupId(exercisesMap);
      setLoading(false);
    };

    setLoading(true);
    fetchExercises();
  }, [groups]);

  return { exercisesByGroupId, loading };
}
