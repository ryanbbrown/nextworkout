import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchExerciseGroups, postExerciseGroup, putExerciseGroup, deleteExerciseGroup } from './api';
import { ExerciseGroup } from './types';

// React Query hooks
export const useExerciseGroups = () => {
    return useQuery<ExerciseGroup[]>({
        queryKey: ['exerciseGroups'],
        queryFn: fetchExerciseGroups
    });
};

export const useCreateExerciseGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postExerciseGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
        }
    });
};

export const useUpdateExerciseGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: putExerciseGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
        }
    });
};

export const useDeleteExerciseGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteExerciseGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
        }
    });
}; 