import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";
import { AccountInformation } from "@/components/profile/AccountInformation";
import { MuscleGrowthVisualization } from "@/components/profile/MuscleGrowthVisualization";
import { SoundSettings } from "@/components/profile/SoundSettings";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Bookmark, Dumbbell } from "lucide-react";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
  profile_photo_url: string | null;
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
        .select('username, fitness_score, fitness_level, last_score_update, profile_photo_url')
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

  if (!profile || !session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader title="Profile" />
        
        <div className="px-4 pt-4 space-y-4">
          {/* Profile Photo Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 flex flex-col items-center gap-4">
              <ProfilePhoto
                profilePhotoUrl={profile.profile_photo_url}
                userId={session.user.id}
                username={profile.username}
                email={session.user.email!}
                onPhotoUpdate={(url) => setProfile(prev => prev ? { ...prev, profile_photo_url: url } : null)}
              />
              
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  {profile.username || session.user.email}
                </p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </Card>
          </motion.div>

          {/* Muscle Growth Visualization Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MuscleGrowthVisualization 
              userId={session.user.id}
              fitnessScore={profile.fitness_score}
              fitnessLevel={profile.fitness_level}
            />
          </motion.div>

          {/* Account Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5">
              <AccountInformation
                userId={session.user.id}
                username={profile.username}
                email={session.user.email!}
                onUsernameUpdate={(newUsername) => setProfile(prev => prev ? { ...prev, username: newUsername } : null)}
              />
            </Card>
          </motion.div>

          {/* Quick Links Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => navigate("/saved-exercises")}
                >
                  <Bookmark className="h-4 w-4" />
                  Saved Exercises
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => navigate("/workout-plan")}
                >
                  <Dumbbell className="h-4 w-4" />
                  Workout Plan Generator
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <SoundSettings />
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
