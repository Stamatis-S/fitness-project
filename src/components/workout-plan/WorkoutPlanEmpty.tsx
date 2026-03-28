
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function WorkoutPlanEmpty() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <p className="text-foreground text-center">
        {t("workoutPlan.emptyMessage")}
      </p>
      <Button
        onClick={() => navigate("/")}
        variant="secondary"
      >
        {t("workoutPlan.backToEntry")}
      </Button>
    </div>
  );
}
