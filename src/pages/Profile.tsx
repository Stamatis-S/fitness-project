
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
}

export default function Profile() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First, trigger a recalculation of the fitness score
        const { error: calcError } = await supabase.rpc(
          'calculate_fitness_score',
          { user_id_param: session?.user.id }
        );

        if (calcError) throw calcError;

        // Then fetch the updated profile data
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Elite':
        return 'text-purple-500 dark:text-purple-400';
      case 'Advanced':
        return 'text-blue-500 dark:text-blue-400';
      case 'Intermediate':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-orange-500 dark:text-orange-400';
    }
  };

  if (!profile) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-accent"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <Card className="p-6 space-y-6 border bg-card text-card-foreground shadow-sm">
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
                Last updated: {format(new Date(profile.last_score_update), 'PPpp')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Level Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="font-medium text-orange-500 dark:text-orange-400">Beginner</p>
                <p className="text-sm text-muted-foreground">0 - 500</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-green-500 dark:text-green-400">Intermediate</p>
                <p className="text-sm text-muted-foreground">501 - 1,500</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-blue-500 dark:text-blue-400">Advanced</p>
                <p className="text-sm text-muted-foreground">1,501 - 3,000</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-purple-500 dark:text-purple-400">Elite</p>
                <p className="text-sm text-muted-foreground">3,001+</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
