
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountInformation } from "@/components/profile/AccountInformation";
import { FitnessLevelCard } from "@/components/profile/FitnessLevelCard";
import { LevelRequirements } from "@/components/profile/LevelRequirements";

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
  const [profile, setProfile] = useState<ProfileData | null>(null);

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

  if (!session) {
    navigate('/auth');
    return null;
  }

  if (!profile) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const setUsername = (newUsername: string) => {
    setProfile(prev => prev ? { ...prev, username: newUsername } : null);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-4">
        <ProfileHeader />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <AccountInformation 
            session={session} 
            username={profile.username} 
            setUsername={setUsername} 
          />

          <FitnessLevelCard
            session={session}
            fitnessScore={profile.fitness_score}
            fitnessLevel={profile.fitness_level}
            lastScoreUpdate={profile.last_score_update}
            refreshProfile={fetchProfile}
          />

          <LevelRequirements />
        </motion.div>
      </div>
    </div>
  );
}
