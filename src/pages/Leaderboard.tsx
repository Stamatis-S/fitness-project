
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Star } from "lucide-react";
import { LeaderboardStats } from "@/components/leaderboard/LeaderboardStats";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  username: string;
  fitness_score: number;
  fitness_level: string;
}

export default function Leaderboard() {
  const { session } = useAuth();
  
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, fitness_score, fitness_level')
        .order('fitness_score', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-3 md:p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-xl md:text-2xl font-bold text-center">Leaderboard</h1>
          
          <Tabs defaultValue="rankings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="stats">Compare Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="rankings" className="mt-4 space-y-4">
              <ScrollArea className="h-[calc(100vh-250px)] rounded-lg">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profiles?.map((profile, index) => (
                      <Card 
                        key={profile.id}
                        className={`p-4 transition-colors ${
                          profile.id === session?.user.id 
                            ? 'bg-primary/5 border-primary/20' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar className="h-12 w-12 border-2 border-primary/20" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {profile.username || 'Anonymous User'}
                                {profile.id === session?.user.id && (
                                  <span className="ml-2 text-sm text-muted-foreground">(You)</span>
                                )}
                              </h3>
                              <span className="text-sm font-medium">
                                Score: {Math.round(profile.fitness_score).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {profile.fitness_level}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <LeaderboardStats />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
