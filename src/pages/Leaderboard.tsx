
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Star, ArrowLeft } from "lucide-react";
import { LeaderboardStats } from "@/components/leaderboard/LeaderboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  username: string;
  fitness_score: number;
  fitness_level: string;
}

export default function Leaderboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  
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
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pb-16">
        <div className="mx-auto space-y-2">
          <div className="flex items-center p-2">
            <button
              className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-2 rounded"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
            <h1 className="text-lg font-bold flex-1 text-center text-white">
              Leaderboard
            </h1>
            <div className="w-[60px]" />
          </div>
          
          <Tabs defaultValue="rankings" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#333333]">
              <TabsTrigger 
                value="rankings" 
                className="text-sm py-1.5 data-[state=active]:bg-[#E22222]"
              >
                Rankings
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="text-sm py-1.5 data-[state=active]:bg-[#E22222]"
              >
                Compare Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rankings" className="mt-2 space-y-2">
              <ScrollArea className="h-[calc(100vh-120px)] rounded-lg">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="p-2 bg-[#222222] border-0">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profiles?.map((profile, index) => (
                      <Card 
                        key={profile.id}
                        className={`p-2 transition-all duration-200 animate-fade-up
                          ${profile.id === session?.user.id 
                            ? 'bg-[#333333] border-[#E22222]/40' 
                            : 'bg-[#222222] border-0 hover:bg-[#2a2a2a]'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#333333]">
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar className="h-8 w-8 border border-[#444444]" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-white">
                                {profile.username || 'Anonymous User'}
                                {profile.id === session?.user.id && (
                                  <span className="ml-1 text-xs text-gray-400">(You)</span>
                                )}
                              </h3>
                              <span className="text-xs font-medium text-[#E22222]">
                                {Math.round(profile.fitness_score).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
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

            <TabsContent value="stats" className="mt-2">
              <LeaderboardStats />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
