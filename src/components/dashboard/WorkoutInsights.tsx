
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";
import type { WorkoutLog } from "@/pages/Dashboard";
import { WorkoutCycleCard } from "./WorkoutCycleCard";

interface WorkoutInsightsProps {
  logs: WorkoutLog[];
}

export function WorkoutInsights({ logs }: WorkoutInsightsProps) {
  const insights = useMemo(() => {
    if (!logs?.length) return null;

    // Find missing workout categories
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentCategories = new Set(
      logs
        .filter(log => new Date(log.workout_date) >= lastMonth)
        .map(log => log.category)
    );
    const allCategories = ["ΣΤΗΘΟΣ", "ΠΛΑΤΗ", "ΔΙΚΕΦΑΛΑ", "ΤΡΙΚΕΦΑΛΑ", "ΩΜΟΙ", "ΠΟΔΙΑ", "ΚΟΡΜΟΣ"];
    const missingCategories = allCategories.filter(cat => !recentCategories.has(cat));

    // Calculate improvements
    const improvements = new Map<string, number>();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    logs.forEach(log => {
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise || !log.weight_kg) return;

      const date = new Date(log.workout_date);
      const key = `${exercise}_${date >= monthAgo ? 'recent' : 'old'}`;
      const currentMax = improvements.get(key) || 0;
      improvements.set(key, Math.max(currentMax, log.weight_kg));
    });

    const exerciseImprovements = Array.from(improvements.entries())
      .reduce((acc, [key, value]) => {
        const [exercise, period] = key.split('_');
        if (!acc[exercise]) acc[exercise] = {};
        acc[exercise][period] = value;
        return acc;
      }, {} as Record<string, { recent?: number; old?: number }>);

    const significantImprovements = Object.entries(exerciseImprovements)
      .filter(([_, values]) => values.recent && values.old && values.recent > values.old)
      .map(([exercise, values]) => ({
        exercise,
        improvement: ((values.recent! - values.old!) / values.old! * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.improvement) - parseFloat(a.improvement));

    return {
      missingCategories,
      improvements: significantImprovements,
      lastWorkoutDate: logs[logs.length - 1]?.workout_date
    };
  }, [logs]);

  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WorkoutCycleCard lastWorkoutDate={insights.lastWorkoutDate} />

      {insights.missingCategories.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Workout Suggestion</h3>
              <p>You haven't trained {insights.missingCategories[0]} in a while!</p>
            </div>
          </div>
        </Card>
      )}

      {insights.improvements[0] && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="font-semibold">Most Improved</h3>
              <p>{insights.improvements[0].exercise} improved by {insights.improvements[0].improvement}% this month!</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
