
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
}

export default function Profile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, fitness_score, fitness_level, last_score_update')
          .eq('id', session?.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        toast.error("Error loading profile");
        console.error("Error:", error);
      }
    };

    if (session?.user.id) {
      fetchProfile();
    }
  }, [session?.user.id]);

  const getProgressValue = (score: number) => {
    if (score >= 3001) return 100;
    if (score >= 1501) return 75;
    if (score >= 501) return 50;
    return Math.max((score / 500) * 25, 0);
  };

  if (!profile) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Account Information</h2>
            <p className="text-muted-foreground">
              Email: {session?.user.email}
            </p>
            <p className="text-muted-foreground">
              Username: {profile.username || 'Not set'}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Fitness Level</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{profile.fitness_level}</span>
                <span className="text-sm text-muted-foreground">
                  Score: {Math.round(profile.fitness_score)}
                </span>
              </div>
              <Progress value={getProgressValue(profile.fitness_score)} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(profile.last_score_update).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Level Requirements</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Beginner: 0 - 500</li>
              <li>Intermediate: 501 - 1,500</li>
              <li>Advanced: 1,501 - 3,000</li>
              <li>Elite: 3,001+</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
