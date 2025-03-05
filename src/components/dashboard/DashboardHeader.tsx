
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:bg-accent h-8 px-2"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="text-xs">Back</span>
        </Button>
        <h1 className="text-lg md:text-xl font-bold">My Dashboard</h1>
      </div>
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        size="sm"
        className="shrink-0 h-8 px-2.5 text-xs"
      >
        New Workout
      </Button>
    </div>
  );
}
