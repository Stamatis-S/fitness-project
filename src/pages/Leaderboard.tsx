import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Trophy, Medal, Star } from "lucide-react";
import { LeaderboardStats } from "@/components/leaderboard/LeaderboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { getFitnessLevelName } from "@/components/profile/utils/progressLevelUtils";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  username: string;
  fitness_score: number;
  fitness_level: string;
  profile_photo_url: string | null;
}

export default function Leaderboard() {
  const { session } = useAuth();
  
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
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getUserInitials = (profile: Profile) => {
    if (profile.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    return 'AN';
  };

  const getFormattedFitnessLevel = (level: string, score: number): string => {
    const standardLevels = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite', 'Legend'];
    const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    
    if (standardLevels.includes(normalizedLevel)) {
      const calculatedLevel = getFitnessLevelName(score);
      if (calculatedLevel !== normalizedLevel) {
        return calculatedLevel;
      }
      return normalizedLevel;
    }
    
    return getFitnessLevelName(score);
  };

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
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader title="Leaderboard" />
        
        <div className="px-4 pt-4">
          <Tabs defaultValue="rankings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="stats">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="rankings" className="mt-4">
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto overscroll-auto pb-20 -webkit-overflow-scrolling-touch">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[60%]" />
                            <Skeleton className="h-3 w-[40%]" />
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
                      const isCurrentUser = profile.id === session?.user.id;
                      
                      return (
                        <motion.div
                          key={profile.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={`p-4 transition-all active:scale-[0.98] ${
                              isCurrentUser 
                                ? 'ring-2 ring-primary bg-primary/5' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10">
                                {getRankIcon(index + 1)}
                              </div>
                              <Avatar className="h-12 w-12 border-2 border-ios-separator">
                                {profile.profile_photo_url ? (
                                  <AvatarImage src={profile.profile_photo_url} alt={profile.username || 'User'} />
                                ) : (
                                  <AvatarFallback className="bg-ios-surface-elevated text-foreground text-sm font-medium">
                                    {getUserInitials(profile)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-medium text-foreground truncate">
                                    {profile.username || 'Anonymous'}
                                    {isCurrentUser && (
                                      <span className="ml-1.5 text-xs text-muted-foreground">(You)</span>
                                    )}
                                  </h3>
                                  <span className="text-base font-semibold text-primary shrink-0">
                                    {Math.round(profile.fitness_score).toLocaleString()}
                                  </span>
                                </div>
                                <p className={`text-sm ${levelColor}`}>
                                  {formattedLevel}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
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
