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
    <div
      className={`bg-zinc-900 p-2 rounded-lg border border-zinc-800 ${className} ${onClick ? 'cursor-pointer hover:bg-zinc-700' : ''}`}
      onClick={onClick}
    >
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-zinc-400">{secondaryText}</p>
      {showAddButton && (
        <div className="mt-1 text-xs text-zinc-400">Click to add set</div>
      )}
    </div>
  );
} 