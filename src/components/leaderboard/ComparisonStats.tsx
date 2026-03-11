
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  Flame,
  Dumbbell,
  Calendar,
  Scale,
  Medal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComparisonStatsProps {
  userId: string;
  comparedUserId: string | null;
  timeRange: string;
}

export function ComparisonStats({ userId, comparedUserId, timeRange }: ComparisonStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ['comparison-stats', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_comparison_stats', { time_range: timeRange });

      if (error) throw error;
      return data;
    },
  });

  if (!stats) return null;

  const currentUserStats = stats.find(s => s.user_id === userId);
  const comparedUserStats = comparedUserId ? stats.find(s => s.user_id === comparedUserId) : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Total Workouts"
        value={currentUserStats?.total_workouts || 0}
        comparedValue={comparedUserStats?.total_workouts}
        icon={Calendar}
      />
      <StatCard
        title="Total Volume"
        value={currentUserStats?.total_volume || 0}
        comparedValue={comparedUserStats?.total_volume}
        icon={Dumbbell}
        unit="kg"
        formatter={(val) => Math.round(val).toLocaleString()}
      />
      <StatCard
        title="Max Weight"
        value={currentUserStats?.max_weight || 0}
        comparedValue={comparedUserStats?.max_weight}
        icon={Scale}
        unit="kg"
      />
      <StatCard
        title="Estimated Calories"
        value={currentUserStats?.estimated_calories || 0}
        comparedValue={comparedUserStats?.estimated_calories}
        icon={Flame}
        unit="kcal"
        formatter={(val) => Math.round(val).toLocaleString()}
      />
      <StatCard
        title="Personal Records"
        value={currentUserStats?.pr_count || 0}
        comparedValue={comparedUserStats?.pr_count}
        icon={Trophy}
      />
    </div>
  );
}
