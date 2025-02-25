
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, Check, RefreshCw, Trophy, Star, Medal, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
  role: "admin" | "user";
}

export default function Profile() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);

  const fetchProfile = async () => {
    try {
      const { error: calcError } = await supabase.rpc(
        'calculate_fitness_score',
        { user_id_param: session?.user.id }
      );

      if (calcError) throw calcError;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, fitness_score, fitness_level, last_score_update, role')
        .eq('id', session?.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setNewUsername(data.username || "");
      }
    } catch (error) {
      toast.error("Error loading profile");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchProfile();
    }
  }, [session?.user.id]);

  const handleUpdateUsername = async () => {
    if (!session?.user.id) {
      toast.error("You must be logged in to update your username");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, username: newUsername } : null);
      setIsEditingUsername(false);
      
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-stats'] });
      
      toast.success("Username updated successfully!");
    } catch (error) {
      toast.error("Error updating username");
      console.error("Error:", error);
    }
  };

  const handleRecalculateScore = async () => {
    setIsRecalculating(true);
    try {
      const { error: calcError } = await supabase.rpc(
        'calculate_fitness_score',
        { user_id_param: session?.user.id }
      );

      if (calcError) throw calcError;
      
      await fetchProfile();
      
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-stats'] });
      
      toast.success("Fitness score recalculated!");
    } catch (error) {
      toast.error("Error recalculating fitness score");
      console.error("Error:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  const getProgressValue = (score: number) => {
    const levelThresholds = {
      monster: 4001,
      elite: 3001,
      advanced: 2001,
      intermediate: 1001,
      beginner: 0
    };

    if (score >= levelThresholds.monster) return 100;
    if (score >= levelThresholds.elite) 
      return 80 + ((score - levelThresholds.elite) / (levelThresholds.monster - levelThresholds.elite)) * 20;
    if (score >= levelThresholds.advanced) 
      return 60 + ((score - levelThresholds.advanced) / (levelThresholds.elite - levelThresholds.advanced)) * 20;
    if (score >= levelThresholds.intermediate) 
      return 40 + ((score - levelThresholds.intermediate) / (levelThresholds.advanced - levelThresholds.intermediate)) * 20;
    return Math.max((score / levelThresholds.intermediate) * 40, 5);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Monster':
        return 'text-[#FF0000] dark:text-[#FF4444]';
      case 'Elite':
        return 'text-[#A855F7] dark:text-[#A855F7]';
      case 'Advanced':
        return 'text-[#4488EF] dark:text-[#4488EF]';
      case 'Intermediate':
        return 'text-[#22C55E] dark:text-[#22C55E]';
      default:
        return 'text-[#EAB308] dark:text-[#EAB308]';
    }
  };

  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return 'Never updated';
      }
      return format(date, 'PPpp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Never updated';
    }
  };

  if (!profile) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1" />
          <h1 className="text-4xl font-bold tracking-tight text-center flex-1">
            Profile
          </h1>
          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-accent"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
        
        <Card className="p-6 space-y-4 border bg-card text-card-foreground shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Account Information</h2>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Email: {session?.user.email}
              </p>
              <div className="flex items-center gap-2">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="max-w-[200px]"
                      placeholder="Enter new username"
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateUsername}
                      disabled={!newUsername.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">
                      Username: {profile.username || 'Not set'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingUsername(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Fitness Level</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRecalculateScore}
                disabled={isRecalculating}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                Recalculate Score
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-2xl font-bold ${getLevelColor(profile.fitness_level)}`}>
                  {profile.fitness_level}
                </span>
                <span className="text-lg font-semibold">
                  Score: {Math.round(profile.fitness_score)}
                </span>
              </div>
              <Progress 
                value={getProgressValue(profile.fitness_score)} 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground">
                Last updated: {formatLastUpdated(profile.last_score_update)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Level Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 shrink-0 text-[#EAB308]" />
                  <p className="font-medium text-[#EAB308]">Beginner</p>
                </div>
                <p className="text-sm text-muted-foreground">0 - 1,000</p>
              </div>
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 shrink-0 text-[#22C55E]" />
                  <p className="font-medium text-[#22C55E]">Intermediate</p>
                </div>
                <p className="text-sm text-muted-foreground">1,001 - 2,000</p>
              </div>
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 shrink-0 text-[#4488EF]" />
                  <p className="font-medium text-[#4488EF]">Advanced</p>
                </div>
                <p className="text-sm text-muted-foreground">2,001 - 3,000</p>
              </div>
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 shrink-0 text-[#A855F7]" />
                  <p className="font-medium text-[#A855F7]">Elite</p>
                </div>
                <p className="text-sm text-muted-foreground">3,001 - 4,000</p>
              </div>
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 shrink-0 text-[#FF0000] dark:text-[#FF4444]" />
                  <p className="font-medium text-[#FF0000] dark:text-[#FF4444]">Monster</p>
                </div>
                <p className="text-sm text-muted-foreground">4,001+</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
