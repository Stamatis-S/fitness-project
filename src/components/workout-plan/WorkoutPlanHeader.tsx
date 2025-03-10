
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkoutPlanHeaderProps {
  title: string;
}

export function WorkoutPlanHeader({ title }: WorkoutPlanHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center p-2">
      <button
        className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-1.5 rounded"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs">Back</span>
      </button>
      <h1 className="text-base font-bold flex-1 text-center text-white">
        {title}
      </h1>
      <div className="w-[50px]" />
    </div>
  );
}
