export const queryKeys = {
  workouts: {
    all: ['workouts'] as const,
    list: () => [...queryKeys.workouts.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.workouts.all, 'detail', id] as const,
  },
  exercises: {
    all: ['exercises'] as const,
    list: () => [...queryKeys.exercises.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.exercises.all, 'detail', id] as const,
    byGroup: (groupId: string) => [...queryKeys.exercises.all, 'group', groupId] as const,
  },
  exerciseGroups: {
    all: ['exerciseGroups'] as const,
    list: () => [...queryKeys.exerciseGroups.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.exerciseGroups.all, 'detail', id] as const,
  },
} as const; 