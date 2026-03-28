
import { Dumbbell } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WorkoutPlanLoading() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="animate-pulse rounded-full bg-secondary h-12 w-12 flex items-center justify-center">
        <Dumbbell className="h-6 w-6 text-foreground" />
      </div>
      <p className="text-foreground text-center">{t("workoutPlan.generating")}</p>
      <p className="text-muted-foreground text-sm text-center">{t("workoutPlan.findingExercises")}</p>
    </div>
  );
}
