
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComparisonStats } from "./ComparisonStats";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";

interface UserStats {
  user_id: string;
  username: string;
  total_workouts: number;
  max_weight: number;
  total_volume: number;
  estimated_calories: number;
  pr_count: number;
}

export function LeaderboardStats() {
  const { session } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("all");

  const { data: stats, isLoading } = useQuery({
    queryKey: ['comparison-stats', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_comparison_stats', { time_range: timeRange });

      if (error) throw error;
      return data;
    },
  });

  // Save comparison history
  const saveComparisonMutation = useMutation({
    mutationFn: async (comparedUserId: string) => {
      if (!session?.user?.id) throw new Error("No user session");
      
      const userStats = stats?.find(s => s.user_id === session.user.id);
      const comparedStats = stats?.find(s => s.user_id === comparedUserId);
      
      if (!userStats || !comparedStats) throw new Error("Stats not found");

      const { error } = await supabase
        .from('comparison_history')
        .insert({
          user_id_a: session.user.id,
          user_id_b: comparedUserId,
          stats_a: userStats,
          stats_b: comparedStats,
          time_range: timeRange,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comparison saved!");
    },
    onError: (error) => {
      console.error("Error saving comparison:", error);
      toast.error("Failed to save comparison");
    },
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (userId) {
      saveComparisonMutation.mutate(userId);
    }
  };

  if (!session?.user?.id || !stats) return null;

  const otherUsers = stats.filter(s => s.user_id !== session.user.id);

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-6 p-1">
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1 p-4 space-y-4">
            <h3 className="text-lg font-semibold">Compare With</h3>
            <Select
              value={selectedUserId || ""}
              onValueChange={handleUserSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user to compare" />
              </SelectTrigger>
              <SelectContent>
                {otherUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6" />
                      {user.username}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Time Range</h3>
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedUserId ? "Stats Comparison" : "Your Stats"}
          </h3>
          <ComparisonStats
            userId={session.user.id}
            comparedUserId={selectedUserId}
            timeRange={timeRange}
          />
        </section>
      </div>
    </ScrollArea>
  );
}
