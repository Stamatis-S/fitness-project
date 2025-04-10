
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Minus, Trash2 } from "lucide-react";
import type { WorkoutExercise, WorkoutPlanExerciseProps } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function WorkoutPlanExercise({ exercise, onExerciseUpdate, onDelete }: WorkoutPlanExerciseProps) {
  const [expanded, setExpanded] = useState(false);
  const [exerciseState, setExerciseState] = useState<WorkoutExercise>({ ...exercise });
  
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "ΣΤΗΘΟΣ": "Chest",
      "ΠΛΑΤΗ": "Back",
      "ΔΙΚΕΦΑΛΑ": "Biceps",
      "ΤΡΙΚΕΦΑΛΑ": "Triceps",
      "ΩΜΟΙ": "Shoulders",
      "ΠΟΔΙΑ": "Legs",
      "ΚΟΡΜΟΣ": "Core",
      "CARDIO": "Cardio"
    };
    return categoryMap[category] || category;
  };

  const handleSetUpdate = (setIndex: number, field: 'weight' | 'reps', value: number) => {
    const updatedSets = [...exerciseState.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value
    };

    const updatedExercise = {
      ...exerciseState,
      sets: updatedSets
    };

    setExerciseState(updatedExercise);
    onExerciseUpdate(updatedExercise);
  };

  const handleIncrement = (setIndex: number, field: 'weight' | 'reps') => {
    const current = exerciseState.sets[setIndex][field];
    const step = field === 'weight' ? 2.5 : 1;
    handleSetUpdate(setIndex, field, current + step);
  };

  const handleDecrement = (setIndex: number, field: 'weight' | 'reps') => {
    const current = exerciseState.sets[setIndex][field];
    const step = field === 'weight' ? 2.5 : 1;
    const newValue = Math.max(0, current - step);
    handleSetUpdate(setIndex, field, newValue);
  };

  const isCardio = exerciseState.category === 'CARDIO';

  return (
    <Card className="overflow-hidden bg-[#333333] border-0 rounded-lg">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
      >
        <div 
          className="flex flex-col flex-grow"
          onClick={() => setExpanded(!expanded)}
        >
          <h3 className="text-base font-medium text-white">{exerciseState.name}</h3>
          <span className="text-xs text-gray-400">{getCategoryLabel(exerciseState.category)}</span>
        </div>
        <div className="flex items-center gap-1">
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-8 w-8 bg-transparent hover:bg-[#444444] text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#2A2A2A] border-[#444444] text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to remove this exercise from your workout plan?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#333333] hover:bg-[#444444] text-white border-0">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8 bg-transparent hover:bg-[#444444] text-white"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="bg-[#2A2A2A] p-3 border-t border-[#444444]">
          <div className="space-y-3">
            {exerciseState.sets.map((set, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center py-1 border-b border-[#3A3A3A] last:border-0">
                <div className="col-span-2 text-white text-center">
                  Set {index + 1}
                </div>
                
                {/* Weight Controls */}
                <div className="col-span-5 flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-[#222222] hover:bg-[#333333]"
                    onClick={() => handleDecrement(index, 'weight')}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={set.weight}
                    onChange={(e) => handleSetUpdate(index, 'weight', parseFloat(e.target.value) || 0)}
                    className="h-7 text-center bg-[#222222] border-[#444444] text-white"
                    min={0}
                    step={isCardio ? 1 : 2.5}
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-[#222222] hover:bg-[#333333]"
                    onClick={() => handleIncrement(index, 'weight')}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Reps Controls */}
                <div className="col-span-5 flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-[#222222] hover:bg-[#333333]"
                    onClick={() => handleDecrement(index, 'reps')}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={set.reps}
                    onChange={(e) => handleSetUpdate(index, 'reps', parseInt(e.target.value) || 0)}
                    className="h-7 text-center bg-[#222222] border-[#444444] text-white"
                    min={0}
                    step={1}
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-[#222222] hover:bg-[#333333]"
                    onClick={() => handleIncrement(index, 'reps')}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
