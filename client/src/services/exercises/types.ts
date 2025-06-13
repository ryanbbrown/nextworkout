export interface Exercise {
    id: string;
    name: string;
    description: string;
    group_id: string;
    user_id: string;
    last_performed: string | null;
    last_dequeued: string | null;
} 