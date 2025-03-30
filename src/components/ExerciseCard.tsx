import { Button } from "@/components/ui/button";

interface ExerciseCardProps {
  name: string;
  // For the second line content - either description or last performed date
  secondaryText: string;
  onClick?: () => void;
  className?: string;
  showAddButton?: boolean;
}

export function ExerciseCard({
  name,
  secondaryText,
  onClick,
  className = "",
  showAddButton = false,
}: ExerciseCardProps) {
  return (
    <Button
      variant="outline"
      className={`flex flex-col items-start bg-zinc-900 hover:bg-zinc-700 text-left border border-zinc-800 rounded-lg p-2 w-full ${className}`}
      onClick={onClick}
    >
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-zinc-400">{secondaryText}</p>
      {showAddButton && (
        <div className="mt-1 text-xs text-zinc-400">Click to add set</div>
      )}
    </Button>
  );
} 