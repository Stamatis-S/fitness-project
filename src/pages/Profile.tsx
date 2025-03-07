
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";
import { AccountInformation } from "@/components/profile/AccountInformation";
import { FitnessLevel } from "@/components/profile/FitnessLevel";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
  role: "admin" | "user";
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
        .select('username, fitness_score, fitness_level, last_score_update, role, profile_photo_url')
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
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="mx-auto space-y-4 p-4">
        <div className="flex items-center">
          <button
            className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-2 rounded"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center text-white">
            Profile
          </h1>
          <div className="w-[60px]" />
        </div>
        
        {/* Profile Photo Card */}
        <Card className="p-4 space-y-3 border-0 bg-[#222222] rounded-lg flex flex-col items-center">
          <ProfilePhoto
            profilePhotoUrl={profile.profile_photo_url}
            userId={session.user.id}
            username={profile.username}
            email={session.user.email!}
            onPhotoUpdate={(url) => setProfile(prev => prev ? { ...prev, profile_photo_url: url } : null)}
          />
          
          <div className="text-center">
            <p className="text-white font-medium">{profile.username || session.user.email}</p>
            <p className="text-gray-400 text-sm">{session.user.email}</p>
          </div>
        </Card>

        {/* Account Information Card */}
        <Card className="p-4 space-y-3 border-0 bg-[#222222] rounded-lg">
          <AccountInformation
            userId={session.user.id}
            username={profile.username}
            email={session.user.email!}
            onUsernameUpdate={(newUsername) => setProfile(prev => prev ? { ...prev, username: newUsername } : null)}
          />
        </Card>

        {/* Fitness Level Card */}
        <Card className="p-4 space-y-3 border-0 bg-[#222222] rounded-lg">
          <FitnessLevel
            userId={session.user.id}
            fitnessScore={profile.fitness_score}
            fitnessLevel={profile.fitness_level}
            lastScoreUpdate={profile.last_score_update}
            onScoreUpdate={(newScore, newLevel) => 
              setProfile(prev => prev ? { 
                ...prev, 
                fitness_score: newScore, 
                fitness_level: newLevel,
                last_score_update: new Date().toISOString()
              } : null)
            }
          />
        </Card>
      </div>
    </div>
  );
}
