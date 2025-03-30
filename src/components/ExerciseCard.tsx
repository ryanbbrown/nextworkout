import { Button } from "@/components/ui/button";

interface ExerciseCardProps {
  name: string;
  // For the second line content - either description or last performed date
  secondaryText: string;
  onClick?: () => void;
  className?: string;
}

export function ExerciseCard({
  name,
  secondaryText,
  onClick,
  className = "",
}: ExerciseCardProps) {
  return (
    <div
      className={`bg-zinc-900 p-2 rounded-lg border border-zinc-800 ${className} ${onClick ? 'cursor-pointer hover:bg-zinc-700' : ''}`}
      onClick={onClick}
    >
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-zinc-400">{secondaryText}</p>
    </div>
  );
} 