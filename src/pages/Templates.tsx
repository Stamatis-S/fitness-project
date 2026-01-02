import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "@/components/PageTransition";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateEditDialog } from "@/components/templates/TemplateEditDialog";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import { useWorkoutTemplates, WorkoutTemplate, TemplateExercise } from "@/hooks/useWorkoutTemplates";
import { Loader2, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Templates() {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useWorkoutTemplates(
    session?.user.id
  );

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [session, authLoading, navigate]);

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    sessionStorage.setItem("loadedTemplate", JSON.stringify(template));
    toast.success(`Template "${template.name}" φορτώθηκε`);
    navigate("/");
  };

  const handleEditTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
  };

  const handleSaveEdit = (id: string, name: string, description: string) => {
    updateTemplate.mutate({ id, name, description });
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate.mutate(id);
  };

  const handleCreateTemplate = (name: string, description: string, exercises: TemplateExercise[]) => {
    createTemplate.mutate({ name, description, exercises });
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['workout_templates', session?.user.id] });
    toast.success("Ανανεώθηκε!");
  }, [queryClient, session?.user.id]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh} className="h-screen">
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader title="Workout Templates" />

        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Τα Templates μου</h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Νέο
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <TemplateList
                  templates={templates}
                  onLoad={handleLoadTemplate}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                />
              )}
            </Card>
          </motion.div>
        </div>
        </div>
      </PullToRefresh>

      <TemplateEditDialog
        template={editingTemplate}
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        onSave={handleSaveEdit}
      />

      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateTemplate}
      />
    </PageTransition>
  );
}
