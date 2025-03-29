
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AddExercises = () => {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  
  // Mock data for exercise groups - this will come from the database later
  const [exerciseGroups, setExerciseGroups] = useState([
    {
      id: "1",
      name: "Upper Body",
      color: "#9333ea", // Purple
      exercises: [
        { id: "1", name: "Push-ups", details: "3x10" },
        { id: "2", name: "Pull-ups", details: "3x8" },
        { id: "3", name: "Shoulder Press", details: "3x12" },
      ]
    },
    {
      id: "2",
      name: "Lower Body",
      color: "#2563eb", // Blue
      exercises: [
        { id: "4", name: "Squats", details: "3x12" },
        { id: "5", name: "Lunges", details: "3x10 each leg" },
      ]
    }
  ]);

  // Mocked color options for exercise groups
  const colorOptions = [
    { name: "Purple", value: "#9333ea" },
    { name: "Blue", value: "#2563eb" },
    { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex items-center">
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
        {exerciseGroups.length === 0 ? (
          <div className="text-center py-10">
            <p className="mb-4 text-gray-400">You don't have any exercise groups yet</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700" 
              onClick={() => setShowCreateGroupModal(true)}
            >
              Create Exercise Group
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {exerciseGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <Card 
                  className="rounded-xl border-0 relative"
                  style={{ backgroundColor: `${group.color}30` /* Add transparency */ }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{group.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowEditGroupModal(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                </Card>
                
                {!isReordering && (
                  <div className="grid grid-cols-3 gap-3">
                    {group.exercises.map((exercise) => (
                      <Button
                        key={exercise.id}
                        variant="outline"
                        className="flex flex-col items-center h-24 bg-gray-800 text-left border-0 rounded-xl relative p-3"
                        onClick={() => setShowEditExerciseModal(true)}
                      >
                        <Pencil className="h-3 w-3 absolute top-2 right-2 text-gray-500" />
                        <div className="mt-2 text-center">
                          <p className="font-medium text-sm line-clamp-2">{exercise.name}</p>
                          <p className="text-xs text-gray-400">{exercise.details}</p>
                        </div>
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center h-24 bg-gray-800 hover:bg-gray-700 border-0 rounded-xl"
                      onClick={() => setShowCreateExerciseModal(true)}
                    >
                      <Plus className="h-6 w-6 mb-1" />
                      <span className="text-xs">Create Exercise</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            {!isReordering && (
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => setShowCreateGroupModal(true)}
              >
                Create Exercise Group
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Modals would be implemented here in a real app */}
      {/* This is just a prototype, so we're not implementing the actual modals yet */}
    </div>
  );
};

export default AddExercises;
