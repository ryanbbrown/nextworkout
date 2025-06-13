import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExerciseGroups, postExerciseGroup, putExerciseGroup, deleteExerciseGroup } from './api';
import { queryKeys } from '../queryKeys';

// React Query hooks
export const useExerciseGroups = () => {
    return useQuery({
        queryKey: queryKeys.exerciseGroups.list(),
        queryFn: fetchExerciseGroups
    });
};

export const useCreateExerciseGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postExerciseGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGroups.all });
        }
    });
};

export const useUpdateExerciseGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: putExerciseGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGroups.all });
        }
    });
};

export const useDeleteExerciseGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteExerciseGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGroups.all });
        }
    });
}; 