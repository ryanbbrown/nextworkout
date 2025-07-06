import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExercises, fetchExercisesByGroup, postExercise, putExercise, deleteExercise } from './api';
import { queryKeys } from '../queryKeys';

// React Query hooks
export const useExercises = () => {
    return useQuery({
        queryKey: queryKeys.exercises.list(),
        queryFn: fetchExercises
    });
};

export const useExercisesByGroup = (groupId: string) => {
    return useQuery({
        queryKey: queryKeys.exercises.byGroup(groupId),
        queryFn: () => fetchExercisesByGroup(groupId),
        enabled: !!groupId
    });
};

export const useCreateExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postExercise,
        onSuccess: (exercise) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.exercises.byGroup(exercise.group_id) });
        }
    });
};

export const useUpdateExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: putExercise,
        onSuccess: (exercise) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.exercises.byGroup(exercise.group_id) });
        }
    });
};

export const useDeleteExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteExercise,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
        }
    });
}; 