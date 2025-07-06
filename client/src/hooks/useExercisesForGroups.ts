import { useState, useEffect } from 'react';
import { ExerciseGroup } from '@/services/exerciseGroups';
import { Exercise } from '@/services/exercises';
import { fetchExercises } from '@/services/exercises/api';

// Custom hook to fetch exercises for all groups
export function useExercisesForGroups(groups: ExerciseGroup[] | undefined) {
    const [exercisesByGroupId, setExercisesByGroupId] = useState<Record<string, Exercise[]>>({});
    const [loading, setLoading] = useState(true);

    // Update exercises when groups change
    useEffect(() => {
        const fetchExercisesForGroups = async () => {
            if (!groups || groups.length === 0) {
                setLoading(false);
                return;
            }

            const exercisesMap: Record<string, Exercise[]> = {};

            try {
                // Fetch all exercises using the API
                const exercises = await fetchExercises();

                // Initialize empty arrays for all groups
                groups.forEach(group => {
                    exercisesMap[group.id] = [];
                });

                // Filter exercises by group ID and organize them
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
        fetchExercisesForGroups();
    }, [groups]);

    return { exercisesByGroupId, loading };
}
