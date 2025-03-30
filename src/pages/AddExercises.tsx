import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useExerciseGroups, useCreateExerciseGroup, useUpdateExerciseGroup, useDeleteExerciseGroup, ExerciseGroup } from "@/services/exerciseGroups";
import { useExercises, useExercisesByGroup, useCreateExercise, useUpdateExercise, useDeleteExercise, Exercise } from "@/services/exercises";

const AddExercises = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReordering, setIsReordering] = useState(false);
  
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [currentGroup, setCurrentGroup] = useState<ExerciseGroup | null>(null);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#9333ea');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editExerciseDescription, setEditExerciseDescription] = useState('');
  
  const { data: exerciseGroups, isLoading: loadingGroups } = useExerciseGroups();
  const { data: allExercises = [] } = useExercises();
  
  const createGroupMutation = useCreateExerciseGroup();
  const updateGroupMutation = useUpdateExerciseGroup();
  const deleteGroupMutation = useDeleteExerciseGroup();
  const createExerciseMutation = useCreateExercise();
  const updateExerciseMutation = useUpdateExercise();
  const deleteExerciseMutation = useDeleteExercise();
  
  const colorOptions = [
    { name: "Purple", value: "#9333ea" },
    { name: "Blue", value: "#2563eb" },
    { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
  ];
  
  const getExercisesByGroup = (groupId: string) => {
    return allExercises.filter(exercise => exercise.group_id === groupId);
  };
  
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Error", description: "Group name cannot be empty", variant: "destructive" });
      return;
    }
    
    createGroupMutation.mutate({
      name: newGroupName,
      color: newGroupColor,
      num_exercises_to_show: 2,
      user_id: user?.id || ''
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Exercise group created successfully" });
        setNewGroupName('');
        setNewGroupColor('#9333ea');
        setShowCreateGroupModal(false);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleEditGroup = () => {
    if (!currentGroup || !editGroupName.trim()) {
      toast({ title: "Error", description: "Group name cannot be empty", variant: "destructive" });
      return;
    }
    
    updateGroupMutation.mutate({
      ...currentGroup,
      name: editGroupName,
      color: editGroupColor
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Exercise group updated successfully" });
        setShowEditGroupModal(false);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleDeleteGroup = (group: ExerciseGroup) => {
    if (confirm(`Are you sure you want to delete ${group.name}? This will also delete all exercises in this group.`)) {
      deleteGroupMutation.mutate(group.id, {
        onSuccess: () => {
          toast({ title: "Success", description: "Exercise group deleted successfully" });
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      });
    }
  };
  
  const handleCreateExercise = () => {
    if (!currentGroupId || !newExerciseName.trim()) {
      toast({ title: "Error", description: "Exercise name cannot be empty", variant: "destructive" });
      return;
    }
    
    createExerciseMutation.mutate({
      name: newExerciseName,
      description: newExerciseDescription,
      group_id: currentGroupId,
      user_id: user?.id || '',
      last_performed: null,
      last_dequeued: null
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Exercise created successfully" });
        setNewExerciseName('');
        setNewExerciseDescription('');
        setShowCreateExerciseModal(false);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleEditExercise = () => {
    if (!currentExercise || !editExerciseName.trim()) {
      toast({ title: "Error", description: "Exercise name cannot be empty", variant: "destructive" });
      return;
    }
    
    updateExerciseMutation.mutate({
      ...currentExercise,
      name: editExerciseName,
      description: editExerciseDescription
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Exercise updated successfully" });
        setShowEditExerciseModal(false);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleDeleteExercise = (exercise: Exercise) => {
    if (confirm(`Are you sure you want to delete ${exercise.name}?`)) {
      deleteExerciseMutation.mutate(exercise.id, {
        onSuccess: () => {
          toast({ title: "Success", description: "Exercise deleted successfully" });
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      });
    }
  };
  
  const openCreateGroupModal = () => {
    setNewGroupName('');
    setNewGroupColor('#9333ea');
    setShowCreateGroupModal(true);
  };
  
  const openEditGroupModal = (group: ExerciseGroup) => {
    setCurrentGroup(group);
    setEditGroupName(group.name);
    setEditGroupColor(group.color);
    setShowEditGroupModal(true);
  };
  
  const openCreateExerciseModal = (groupId: string) => {
    setCurrentGroupId(groupId);
    setNewExerciseName('');
    setNewExerciseDescription('');
    setShowCreateExerciseModal(true);
  };
  
  const openEditExerciseModal = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setEditExerciseName(exercise.name);
    setEditExerciseDescription(exercise.description);
    setShowEditExerciseModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 border-b border-neutral-800 flex items-center">
        <Link to="/home" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Add Exercises</h1>
        
        {!isReordering ? (
          <Button 
            variant="ghost" 
            className="ml-auto"
            onClick={() => setIsReordering(true)}
          >
            Reorder Groups
          </Button>
        ) : (
          <Button 
            className="ml-auto bg-green-600 hover:bg-green-700"
            onClick={() => setIsReordering(false)}
          >
            Save Order
          </Button>
        )}
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {loadingGroups ? (
          <div className="text-center py-10">
            <p className="text-neutral-400">Loading exercise groups...</p>
          </div>
        ) : exerciseGroups?.length === 0 ? (
          <div className="text-center py-10">
            <p className="mb-4 text-neutral-400">You don't have any exercise groups yet</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700" 
              onClick={openCreateGroupModal}
            >
              Create Exercise Group
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {exerciseGroups?.map((group) => (
              <div key={group.id} className="space-y-3">
                <Card 
                  className="rounded-xl bg-transparent border relative"
                  style={{ borderColor: group.color }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center" style={{ color: group.color }}>
                      <span>{group.name}</span>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditGroupModal(group)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteGroup(group)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2">
                    {!isReordering && (
                      <div className="grid grid-cols-3 gap-2">
                        {getExercisesByGroup(group.id).map((exercise) => (
                          <Button
                            key={exercise.id}
                            variant="outline"
                            className="flex flex-col items-center h-24 bg-zinc-900 hover:bg-zinc-700 text-left border border-zinc-800 rounded-xl relative p-2"
                            onClick={() => openEditExerciseModal(exercise)}
                          >
                            <div className="w-full h-full flex flex-col justify-center gap-0.5">
                              <p className="font-medium text-sm text-center whitespace-normal break-words px-0.5">{exercise.name}</p>
                              <p className="text-xs text-neutral-400 text-center whitespace-normal break-words line-clamp-2 px-0.5">{exercise.description}</p>
                            </div>
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          className="flex flex-col items-center justify-center h-24 bg-zinc-900 hover:bg-zinc-700 border border-zinc-800 rounded-xl"
                          onClick={() => openCreateExerciseModal(group.id)}
                        >
                          <Plus className="h-6 w-6 mb-1" />
                          <span className="text-xs">Create Exercise</span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {!isReordering && (
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={openCreateGroupModal}
              >
                Create Exercise Group
              </Button>
            )}
          </div>
        )}
      </main>

      <Dialog open={showCreateGroupModal} onOpenChange={setShowCreateGroupModal}>
        <DialogContent className="bg-neutral-800 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle>Create Exercise Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input 
                id="group-name" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                placeholder="e.g., Upper Body"
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    className={`h-10 rounded-md ${newGroupColor === color.value ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewGroupColor(color.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateGroupModal(false)}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateGroup}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditGroupModal} onOpenChange={setShowEditGroupModal}>
        <DialogContent className="bg-neutral-800 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle>Edit Exercise Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input 
                id="edit-group-name" 
                value={editGroupName} 
                onChange={(e) => setEditGroupName(e.target.value)} 
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    className={`h-10 rounded-md ${editGroupColor === color.value ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEditGroupColor(color.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditGroupModal(false)}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleEditGroup}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateExerciseModal} onOpenChange={setShowCreateExerciseModal}>
        <DialogContent className="bg-neutral-800 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle>Create Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input 
                id="exercise-name" 
                value={newExerciseName} 
                onChange={(e) => setNewExerciseName(e.target.value)} 
                placeholder="e.g., Push-ups"
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exercise-description">Description (sets, reps, etc.)</Label>
              <Input 
                id="exercise-description" 
                value={newExerciseDescription} 
                onChange={(e) => setNewExerciseDescription(e.target.value)} 
                placeholder="e.g., 3x10"
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateExerciseModal(false)}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateExercise}>
              Create Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditExerciseModal} onOpenChange={setShowEditExerciseModal}>
        <DialogContent className="bg-neutral-800 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-exercise-name">Exercise Name</Label>
              <Input 
                id="edit-exercise-name" 
                value={editExerciseName} 
                onChange={(e) => setEditExerciseName(e.target.value)} 
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-exercise-description">Description (sets, reps, etc.)</Label>
              <Input 
                id="edit-exercise-description" 
                value={editExerciseDescription} 
                onChange={(e) => setEditExerciseDescription(e.target.value)} 
                className="bg-neutral-700 border-neutral-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditExerciseModal(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="mr-auto"
              onClick={() => {
                if (currentExercise) {
                  handleDeleteExercise(currentExercise);
                  setShowEditExerciseModal(false);
                }
              }}
            >
              Delete
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleEditExercise}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddExercises;
