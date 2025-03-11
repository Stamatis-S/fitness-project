
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  profile_photo_url: string | null;
}

export default function Leaderboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, fitness_score, fitness_level, profile_photo_url')
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
        return <Star className="h-6 w-6 text-gray-600" />;
    }
  };

  const getUserInitials = (profile: Profile) => {
    if (profile.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    return 'AN'; // For Anonymous
  };

  // Function to format the fitness level display
  const getFormattedFitnessLevel = (level: string, score: number): string => {
    // First check if level is already one of our expected values
    const standardLevels = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite', 'Legend'];
    const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    
    if (standardLevels.includes(normalizedLevel)) {
      return normalizedLevel;
    }
    
    // Fallback to determining level from score
    if (score >= 6000) return 'Legend';
    if (score >= 4500) return 'Elite';
    if (score >= 3000) return 'Advanced';
    if (score >= 1500) return 'Intermediate';
    if (score >= 500) return 'Novice';
    return 'Beginner';
  };

  // Get appropriate color for fitness level
  const getLevelColor = (level: string): string => {
    const normalizedLevel = level.toLowerCase();
    
    switch (normalizedLevel) {
      case 'legend':
        return 'text-[#FF00FF]';
      case 'elite':
        return 'text-[#A855F7]';
      case 'advanced':
        return 'text-[#4488EF]';
      case 'intermediate':
        return 'text-[#22C55E]';
      case 'novice':
        return 'text-[#EAB308]';
      case 'beginner':
      default:
        return 'text-[#EAB308]';
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

            <TabsContent value="rankings" className="mt-2 space-y-3">
              <ScrollArea className="h-[calc(100vh-120px)] rounded-lg">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="p-4 bg-[#222222] border-0">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[180px]" />
                            <Skeleton className="h-4 w-[120px]" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profiles?.map((profile, index) => {
                      const formattedLevel = getFormattedFitnessLevel(profile.fitness_level || 'Beginner', profile.fitness_score || 0);
                      const levelColor = getLevelColor(formattedLevel);
                      
                      return (
                        <Card 
                          key={profile.id}
                          className={`p-5 transition-all duration-200 animate-fade-up
                            ${profile.id === session?.user.id 
                              ? 'bg-[#333333] border-[#E22222]/40' 
                              : 'bg-[#222222] border-0 hover:bg-[#2a2a2a]'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#333333]">
                              {getRankIcon(index + 1)}
                            </div>
                            <Avatar className="h-14 w-14 border border-[#444444]">
                              {profile.profile_photo_url ? (
                                <AvatarImage src={profile.profile_photo_url} alt={profile.username || 'User'} />
                              ) : (
                                <AvatarFallback className="bg-[#333333] text-white text-base">
                                  {getUserInitials(profile)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">
                                  {profile.username || 'Anonymous User'}
                                  {profile.id === session?.user.id && (
                                    <span className="ml-1 text-xs text-gray-400">(You)</span>
                                  )}
                                </h3>
                                <span className="text-base font-medium text-[#E22222]">
                                  {Math.round(profile.fitness_score).toLocaleString()}
                                </span>
                              </div>
                              <p className={`text-sm ${levelColor}`}>
                                {formattedLevel}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
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
