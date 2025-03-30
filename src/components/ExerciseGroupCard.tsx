import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseGroup } from "@/services/exerciseGroups";
import { Exercise } from "@/services/exercises";
import { ExerciseCard } from "./ExerciseCard";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface ExerciseGroupCardProps {
  group: ExerciseGroup;
  exercises: Exercise[];
  onExerciseClick?: (exercise: Exercise) => void;
  maxExercises?: number;
  renderExerciseSecondaryText?: (exercise: Exercise) => string;
  // Add Exercises page specific props
  showControls?: boolean;
  onEditGroup?: (group: ExerciseGroup) => void;
  onDeleteGroup?: (group: ExerciseGroup) => void;
  showCreateExercise?: boolean;
  onCreateExercise?: (groupId: string) => void;
}

export function ExerciseGroupCard({
  group,
  exercises,
  onExerciseClick,
  maxExercises,
  renderExerciseSecondaryText = (exercise) => exercise.description,
  showControls = false,
  onEditGroup,
  onDeleteGroup,
  showCreateExercise = false,
  onCreateExercise,
}: ExerciseGroupCardProps) {
  const displayExercises = maxExercises ? exercises.slice(0, maxExercises) : exercises;

  return (
    <Card 
      className="rounded-xl border bg-transparent"
      style={{ borderColor: group.color }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center" style={{ color: group.color }}>
          <span>{group.name}</span>
          {showControls && (
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onEditGroup?.(group)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500"
                onClick={() => onDeleteGroup?.(group)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {displayExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              name={exercise.name}
              secondaryText={renderExerciseSecondaryText(exercise)}
              onClick={onExerciseClick ? () => onExerciseClick(exercise) : undefined}
            />
          ))}
          {showCreateExercise && (
            <div 
              className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 cursor-pointer hover:bg-zinc-700"
              onClick={() => onCreateExercise?.(group.id)}
            >
              <div className="h-full flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" />
                <span className="text-xs">Create</span>
              </div>
            </div>
          )}
        </div>
        {exercises.length === 0 && (
          <p className="text-sm text-neutral-400">No exercises in this group yet</p>
        )}
      </CardContent>
    </Card>
  );
} 