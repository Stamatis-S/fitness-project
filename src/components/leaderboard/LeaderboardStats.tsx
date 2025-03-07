
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComparisonStats } from "./ComparisonStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserStats {
  user_id: string;
  username: string;
  total_workouts: number;
  max_weight: number;
  total_volume: number;
  estimated_calories: number;
  pr_count: number;
  profile_photo_url?: string | null;
}

export function LeaderboardStats() {
  const { session } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("all");

  const { data: stats } = useQuery({
    queryKey: ['comparison-stats', timeRange],
    queryFn: async () => {
      // First get the comparison stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_comparison_stats', { time_range: timeRange });

      if (statsError) throw statsError;
      
      // Then get profile photos for each user
      if (statsData && statsData.length > 0) {
        const userIds = statsData.map((s: any) => s.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, profile_photo_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Merge the profile photo URLs with the stats data
        return statsData.map((stat: any) => {
          const profile = profilesData?.find(p => p.id === stat.user_id);
          return {
            ...stat,
            profile_photo_url: profile?.profile_photo_url || null
          };
        }) as UserStats[];
      }
      
      return statsData as UserStats[];
    },
  });

  if (!session?.user?.id || !stats) return null;

  const otherUsers = stats.filter(s => s.user_id !== session.user.id);

  const getUserInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : 'AN';
  };

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-6 p-1">
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1 p-5 space-y-4">
            <h3 className="text-lg font-semibold">Compare With</h3>
            <Select
              value={selectedUserId || ""}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger className="py-2">
                <SelectValue placeholder="Select a user to compare" />
              </SelectTrigger>
              <SelectContent>
                {otherUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    <div className="flex items-center gap-3 py-1">
                      <Avatar className="h-10 w-10">
                        {user.profile_photo_url ? (
                          <AvatarImage src={user.profile_photo_url} alt={user.username} />
                        ) : (
                          <AvatarFallback className="bg-[#333333] text-white text-sm">
                            {getUserInitials(user.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-base">{user.username}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-lg font-semibold">Time Range</h3>
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="py-2">
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
