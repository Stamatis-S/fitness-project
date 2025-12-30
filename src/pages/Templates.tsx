import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateEditDialog } from "@/components/templates/TemplateEditDialog";
import { useWorkoutTemplates, WorkoutTemplate } from "@/hooks/useWorkoutTemplates";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Templates() {
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  const { templates, isLoading, updateTemplate, deleteTemplate } = useWorkoutTemplates(
    session?.user.id
  );

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [session, authLoading, navigate]);

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    // Store template in sessionStorage to load in exercise entry
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
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader title="Workout Templates" />

        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Τα Templates μου</h2>
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

      <TemplateEditDialog
        template={editingTemplate}
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        onSave={handleSaveEdit}
      />
    </PageTransition>
  );
}
