
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { UserInfo } from "@/components/profile/UserInfo";
import { FitnessStats } from "@/components/profile/FitnessStats";
import { LevelRequirements } from "@/components/profile/LevelRequirements";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
}

export default function Profile() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    if (!session?.user.id) {
      navigate('/auth');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, fitness_score, fitness_level, last_score_update')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        toast.error("Error loading profile");
        return;
      }

      if (data) {
        setProfile(data);
        setNewUsername(data.username || "");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  const handleUpdateUsername = async () => {
    if (!session?.user.id) return;

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
    } catch (error: any) {
      toast.error("Error updating username");
      console.error("Error:", error);
    }
  };

  const handleRecalculateScore = async () => {
    if (!session?.user.id) return;

    setIsRecalculating(true);
    try {
      const { error: calcError } = await supabase.rpc(
        'calculate_fitness_score',
        { user_id_param: session.user.id }
      );

      if (calcError) throw calcError;
      
      await fetchProfile();
      
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-stats'] });
      
      toast.success("Fitness score recalculated!");
    } catch (error: any) {
      toast.error("Error recalculating fitness score");
      console.error("Error:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Handle unauthorized access
  if (!session) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center gap-4">
        <p>Could not load profile data</p>
        <Button onClick={() => fetchProfile()}>Retry</Button>
      </div>
    );
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
        
        <Card className="p-6 space-y-6 border bg-card text-card-foreground shadow-sm">
          <UserInfo
            session={session}
            username={profile.username}
            isEditingUsername={isEditingUsername}
            newUsername={newUsername}
            setIsEditingUsername={setIsEditingUsername}
            setNewUsername={setNewUsername}
            onUpdateUsername={handleUpdateUsername}
          />

          <FitnessStats
            fitnessScore={profile.fitness_score}
            fitnessLevel={profile.fitness_level}
            lastScoreUpdate={profile.last_score_update}
            isRecalculating={isRecalculating}
            onRecalculate={handleRecalculateScore}
          />

          <LevelRequirements />
        </Card>
      </div>
    </div>
  );
}
