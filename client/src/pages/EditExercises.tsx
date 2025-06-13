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
import { ExerciseCard } from "@/components/ExerciseCard";
import { ExerciseGroupCard } from "@/components/ExerciseGroupCard";

const EditExercises = () => {
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
            toast({
                title: "Error",
                description: "Group name cannot be empty",
                variant: "destructive",
                duration: 1000
            });
            return;
        }

        createGroupMutation.mutate({
            name: newGroupName,
            color: newGroupColor,
            num_exercises_to_show: 2,
            user_id: user?.id || ''
        }, {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Exercise group created successfully",
                    duration: 1000
                });
                setNewGroupName('');
                setNewGroupColor('#9333ea');
                setShowCreateGroupModal(false);
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                    duration: 1000
                });
            }
        });
    };

    const handleEditGroup = () => {
        if (!currentGroup || !editGroupName.trim()) {
            toast({
                title: "Error",
                description: "Group name cannot be empty",
                variant: "destructive",
                duration: 1000
            });
            return;
        }

        updateGroupMutation.mutate({
            ...currentGroup,
            name: editGroupName,
            color: editGroupColor
        }, {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Exercise group updated successfully",
                    duration: 1000
                });
                setShowEditGroupModal(false);
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                    duration: 1000
                });
            }
        });
    };

    const handleDeleteGroup = (group: ExerciseGroup) => {
        if (confirm(`Are you sure you want to delete ${group.name}? This will also delete all exercises in this group.`)) {
            deleteGroupMutation.mutate(group.id, {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Exercise group deleted successfully",
                        duration: 1000
                    });
                },
                onError: (error) => {
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                        duration: 1000
                    });
                }
            });
        }
    };

    const handleCreateExercise = () => {
        if (!currentGroupId || !newExerciseName.trim()) {
            toast({
                title: "Error",
                description: "Exercise name cannot be empty",
                variant: "destructive",
                duration: 1000
            });
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
                toast({
                    title: "Success",
                    description: "Exercise created successfully",
                    duration: 1000
                });
                setNewExerciseName('');
                setNewExerciseDescription('');
                setShowCreateExerciseModal(false);
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                    duration: 1000
                });
            }
        });
    };

    const handleEditExercise = () => {
        if (!currentExercise || !editExerciseName.trim()) {
            toast({
                title: "Error",
                description: "Exercise name cannot be empty",
                variant: "destructive",
                duration: 1000
            });
            return;
        }

        updateExerciseMutation.mutate({
            ...currentExercise,
            name: editExerciseName,
            description: editExerciseDescription
        }, {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Exercise updated successfully",
                    duration: 1000
                });
                setShowEditExerciseModal(false);
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                    duration: 1000
                });
            }
        });
    };

    const handleDeleteExercise = (exercise: Exercise) => {
        if (confirm(`Are you sure you want to delete ${exercise.name}?`)) {
            deleteExerciseMutation.mutate(exercise.id, {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Exercise deleted successfully",
                        duration: 1000
                    });
                },
                onError: (error) => {
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                        duration: 1000
                    });
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
                <h1 className="text-xl font-bold">Edit Exercises</h1>

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
                                {!isReordering && (
                                    <ExerciseGroupCard
                                        group={group}
                                        exercises={getExercisesByGroup(group.id)}
                                        showControls={true}
                                        onEditGroup={openEditGroupModal}
                                        onDeleteGroup={handleDeleteGroup}
                                        showCreateExercise={true}
                                        onCreateExercise={openCreateExerciseModal}
                                        onExerciseClick={openEditExerciseModal}
                                    />
                                )}
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
                <DialogContent className="bg-zinc-900 text-white border-zinc-800 rounded-xl w-[95%] max-w-lg mx-auto">
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
                                className="bg-zinc-800 border-zinc-700 text-white"
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
                    <DialogFooter className="flex justify-center">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-1/2" onClick={handleCreateGroup}>
                            Create Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditGroupModal} onOpenChange={setShowEditGroupModal}>
                <DialogContent className="bg-zinc-900 text-white border-zinc-800 rounded-xl w-[95%] max-w-lg mx-auto">
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
                                className="bg-zinc-800 border-zinc-700 text-white"
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
                    <DialogFooter className="flex justify-center">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-1/2" onClick={handleEditGroup}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreateExerciseModal} onOpenChange={setShowCreateExerciseModal}>
                <DialogContent className="bg-zinc-900 text-white border-zinc-800 rounded-xl w-[95%] max-w-lg mx-auto">
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
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exercise-description">Description (sets, reps, etc.)</Label>
                            <Input
                                id="exercise-description"
                                value={newExerciseDescription}
                                onChange={(e) => setNewExerciseDescription(e.target.value)}
                                placeholder="e.g., 3x10"
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-center">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-1/2" onClick={handleCreateExercise}>
                            Create Exercise
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditExerciseModal} onOpenChange={setShowEditExerciseModal}>
                <DialogContent className="bg-zinc-900 text-white border-zinc-800 rounded-xl w-[95%] max-w-lg mx-auto">
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
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-exercise-description">Description (sets, reps, etc.)</Label>
                            <Input
                                id="edit-exercise-description"
                                value={editExerciseDescription}
                                onChange={(e) => setEditExerciseDescription(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col gap-4 items-center">
                        <Button
                            variant="destructive"
                            className="w-1/2"
                            onClick={() => {
                                if (currentExercise) {
                                    handleDeleteExercise(currentExercise);
                                    setShowEditExerciseModal(false);
                                }
                            }}
                        >
                            Delete
                        </Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-1/2" onClick={handleEditExercise}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditExercises;
