import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bookmark, Plus, Play, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Array<{
    category: string;
    exercise_id: number | null;
    custom_exercise: string | null;
    sets: Array<{ weight: number; reps: number }>;
  }>;
}

interface WorkoutTemplatesProps {
  onLoadTemplate: (template: WorkoutTemplate) => void;
  currentExercises?: any[];
}

export function WorkoutTemplates({ onLoadTemplate, currentExercises }: WorkoutTemplatesProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // For now, we'll use localStorage for templates
  // In a production app, you'd want to create a database table for this
  const { data: templates = [], refetch } = useQuery({
    queryKey: ['workout-templates', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];
      const stored = localStorage.getItem(`workout-templates-${session.user.id}`);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!session?.user.id,
  });

  const saveTemplate = () => {
    if (!newTemplateName.trim() || !currentExercises || currentExercises.length === 0) {
      toast.error('Enter a name and add exercises first');
      return;
    }

    const newTemplate: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name: newTemplateName.trim(),
      exercises: currentExercises,
    };

    const updatedTemplates = [...templates, newTemplate];
    localStorage.setItem(`workout-templates-${session?.user.id}`, JSON.stringify(updatedTemplates));
    
    setNewTemplateName('');
    setIsSaving(false);
    refetch();
    toast.success('Template saved!');
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter((t: WorkoutTemplate) => t.id !== id);
    localStorage.setItem(`workout-templates-${session?.user.id}`, JSON.stringify(updatedTemplates));
    refetch();
    toast.success('Template deleted');
  };

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    onLoadTemplate(template);
    setIsOpen(false);
    toast.success(`Loaded "${template.name}"`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-14 justify-start gap-3 bg-ios-surface-elevated border-0 hover:bg-ios-fill flex-1"
        >
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-accent" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">Templates</span>
            <span className="text-xs text-muted-foreground">
              {templates.length} saved
            </span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Workout Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Save current workout as template */}
          {currentExercises && currentExercises.length > 0 && (
            <div className="space-y-2">
              {isSaving ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Template name..."
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={saveTemplate} size="sm">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsSaving(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSaving(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Save Current as Template
                </Button>
              )}
            </div>
          )}

          {/* Template list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {templates.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No templates saved yet
                </p>
              ) : (
                templates.map((template: WorkoutTemplate) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-2 p-3 bg-ios-surface rounded-ios"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.exercises.length} exercise{template.exercises.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      <Play className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
