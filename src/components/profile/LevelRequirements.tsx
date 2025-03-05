
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Medal, Star, Trophy } from "lucide-react";

export function LevelRequirements() {
  return (
    <Card className="p-4 space-y-2 border bg-card text-card-foreground shadow-sm">
      <h3 className="text-base font-medium">Level Requirements</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 text-xs">
        <div className="p-1.5 glass-card rounded-md">
          <div className="flex items-center gap-1.5">
            <ArrowDown className="h-3.5 w-3.5 shrink-0 text-[#EAB308]" />
            <p className="font-medium text-[#EAB308]">Beginner</p>
          </div>
          <p className="text-muted-foreground">0 - 1,000</p>
        </div>
        <div className="p-1.5 glass-card rounded-md">
          <div className="flex items-center gap-1.5">
            <ArrowUp className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
            <p className="font-medium text-[#22C55E]">Intermediate</p>
          </div>
          <p className="text-muted-foreground">1,001 - 2,000</p>
        </div>
        <div className="p-1.5 glass-card rounded-md">
          <div className="flex items-center gap-1.5">
            <Medal className="h-3.5 w-3.5 shrink-0 text-[#4488EF]" />
            <p className="font-medium text-[#4488EF]">Advanced</p>
          </div>
          <p className="text-muted-foreground">2,001 - 3,000</p>
        </div>
        <div className="p-1.5 glass-card rounded-md">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 shrink-0 text-[#A855F7]" />
            <p className="font-medium text-[#A855F7]">Elite</p>
          </div>
          <p className="text-muted-foreground">3,001 - 4,000</p>
        </div>
        <div className="p-1.5 glass-card rounded-md">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 shrink-0 text-[#FF0000] dark:text-[#FF4444]" />
            <p className="font-medium text-[#FF0000] dark:text-[#FF4444]">Monster</p>
          </div>
          <p className="text-muted-foreground">4,001+</p>
        </div>
      </div>
    </Card>
  );
}
