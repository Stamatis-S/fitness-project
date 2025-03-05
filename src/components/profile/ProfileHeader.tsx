
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProfileHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 hover:bg-accent"
        onClick={() => navigate("/")}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-xs">Back</span>
      </Button>
      <h1 className="text-xl font-bold tracking-tight text-center">
        Profile
      </h1>
      <div className="w-16"></div> {/* Spacer to center the heading */}
    </div>
  );
}
