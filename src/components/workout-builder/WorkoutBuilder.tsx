import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseGrid } from "./ExerciseGrid";
import { WorkoutCanvas } from "./WorkoutCanvas";
import { BottomSheet } from "./BottomSheet";
import { AITemplates } from "./AITemplates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { ExerciseCategory } from "@/lib/constants";
import type { WorkoutExercise, WorkoutTemplate } from "./types";

export function WorkoutBuilder() {
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [activeTab, setActiveTab] = useState<"exercises" | "templates">("exercises");
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [draggedExercise, setDraggedExercise] = useState<WorkoutExercise | null>(null);
  const [isHapticSupported, setIsHapticSupported] = useState(false);
  
  const isMobile = useIsMobile();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if haptic feedback is supported
    setIsHapticSupported('vibrate' in navigator);
  }, []);

  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (isHapticSupported) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleExerciseAdd = (exercise: WorkoutExercise) => {
    setSelectedExercises(prev => [...prev, { ...exercise, id: Date.now().toString() }]);
    triggerHapticFeedback('light');
    toast.success(`${exercise.name} προστέθηκε στο workout`);
  };

  const handleExerciseRemove = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    triggerHapticFeedback('light');
    toast.success("Άσκηση αφαιρέθηκε");
  };

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    setSelectedExercises(template.exercises);
    triggerHapticFeedback('medium');
    toast.success(`Template "${template.name}" φορτώθηκε`);
  };

  const handleLongPressStart = (exercise: WorkoutExercise) => {
    if (!isMobile) return;
    
    longPressTimer.current = setTimeout(() => {
      setDraggedExercise(exercise);
      triggerHapticFeedback('heavy');
      toast.success("Σύρε για να προσθέσεις στο workout", {
        duration: 1500,
      });
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleSaveWorkout = async () => {
    if (selectedExercises.length === 0) {
      toast.error("Προσθέστε ασκήσεις στο workout");
      return;
    }

    try {
      // Here you would save to database
      triggerHapticFeedback('medium');
      toast.success("Workout αποθηκεύτηκε επιτυχώς!");
    } catch (error) {
      toast.error("Σφάλμα κατά την αποθήκευση");
    }
  };

  const handleClearWorkout = () => {
    setSelectedExercises([]);
    triggerHapticFeedback('light');
    toast.success("Workout καθαρίστηκε");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Workout Builder</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearWorkout}
                disabled={selectedExercises.length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Καθάρισμα
              </Button>
              <Button
                size="sm"
                onClick={handleSaveWorkout}
                disabled={selectedExercises.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Αποθήκευση
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exercise Selection */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="exercises">Ασκήσεις</TabsTrigger>
                    <TabsTrigger value="templates">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Templates
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="exercises" className="mt-4">
                    <ExerciseGrid
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      onExerciseAdd={handleExerciseAdd}
                      onLongPressStart={handleLongPressStart}
                      onLongPressEnd={handleLongPressEnd}
                      isMobile={isMobile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="templates" className="mt-4">
                    <AITemplates onTemplateSelect={handleTemplateSelect} />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Workout Canvas */}
            <div className="lg:col-span-1">
              <WorkoutCanvas
                exercises={selectedExercises}
                onExerciseRemove={handleExerciseRemove}
                draggedExercise={draggedExercise}
                onDragComplete={() => setDraggedExercise(null)}
              />
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="exercises">Ασκήσεις</TabsTrigger>
                <TabsTrigger value="templates">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="exercises" className="mt-4">
                <ExerciseGrid
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onExerciseAdd={handleExerciseAdd}
                  onLongPressStart={handleLongPressStart}
                  onLongPressEnd={handleLongPressEnd}
                  isMobile={isMobile}
                />
              </TabsContent>
              
              <TabsContent value="templates" className="mt-4">
                <AITemplates onTemplateSelect={handleTemplateSelect} />
              </TabsContent>
            </Tabs>

            {/* Mobile Workout Summary */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Το Workout μου</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedExercises.length} ασκήσεις
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBottomSheet(true)}
                  disabled={selectedExercises.length === 0}
                >
                  Προβολή
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        exercises={selectedExercises}
        onExerciseRemove={handleExerciseRemove}
        onSave={handleSaveWorkout}
        onClear={handleClearWorkout}
      />
    </div>
  );
}