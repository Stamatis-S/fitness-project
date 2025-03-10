
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function WorkoutPlanEmpty() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <p className="text-white text-center">
        Unable to generate a workout plan. Please log more exercises to get personalized recommendations.
      </p>
      <Button
        onClick={() => navigate("/")}
        className="bg-[#333333] hover:bg-[#444444] text-white"
      >
        Back to Exercise Entry
      </Button>
    </div>
  );
}
