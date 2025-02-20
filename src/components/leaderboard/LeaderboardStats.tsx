
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WorkoutStats {
  user_id: string;
  username: string;
  total_workouts: number;
  max_weight: number;
  total_volume: number;
  favorite_category: string;
}

export function LeaderboardStats() {
  const { session } = useAuth();

  const { data: stats } = useQuery<WorkoutStats[]>({
    queryKey: ['leaderboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_workout_stats');

      if (error) throw error;
      return data;
    },
  });

  if (!stats) return null;

  const currentUserStats = stats.find(s => s.user_id === session?.user.id);
  const maxVolume = Math.max(...stats.map(s => s.total_volume));
  const maxWorkouts = Math.max(...stats.map(s => s.total_workouts));

  const volumeData = stats.map(stat => ({
    name: stat.username || 'Anonymous',
    volume: Math.round(stat.total_volume),
    isCurrentUser: stat.user_id === session?.user.id,
  }));

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-6 p-1">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Total Volume Comparison</h3>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="volume"
                  fill="hsl(var(--primary))"
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Your Stats vs Others</h3>
          <div className="grid gap-4">
            {currentUserStats && (
              <>
                <Card className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Workouts</span>
                    <span className="text-sm font-medium">
                      {currentUserStats.total_workouts} / {maxWorkouts}
                    </span>
                  </div>
                  <Progress 
                    value={(currentUserStats.total_workouts / maxWorkouts) * 100} 
                  />
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Weight Lifted</span>
                    <span className="text-sm font-medium">
                      {currentUserStats.max_weight}kg
                    </span>
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Volume</span>
                    <span className="text-sm font-medium">
                      {Math.round(currentUserStats.total_volume).toLocaleString()}kg
                    </span>
                  </div>
                  <Progress 
                    value={(currentUserStats.total_volume / maxVolume) * 100} 
                  />
                </Card>

                <Card className="p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Most Trained Category</span>
                    <span className="text-sm font-medium">
                      {currentUserStats.favorite_category}
                    </span>
                  </div>
                </Card>
              </>
            )}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
