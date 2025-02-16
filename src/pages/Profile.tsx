
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";

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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { error: calcError } = await supabase.rpc(
          'calculate_fitness_score',
          { user_id_param: session?.user.id }
        );

        if (calcError) throw calcError;

        const { data, error } = await supabase
          .from('profiles')
          .select('username, fitness_score, fitness_level, last_score_update')
          .eq('id', session?.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setNewUsername(data.username || "");
      } catch (error) {
        toast.error("Error loading profile");
        console.error("Error:", error);
      }
    };

    if (session?.user.id) {
      fetchProfile();
    }
  }, [session?.user.id]);

  const handleUpdateUsername = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', session?.user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, username: newUsername } : null);
      setIsEditingUsername(false);
      toast.success("Username updated successfully!");
    } catch (error) {
      toast.error("Error updating username");
      console.error("Error:", error);
    }
  };

  const getProgressValue = (score: number) => {
    if (score >= 5001) return 100;
    if (score >= 3501) return 80;
    if (score >= 2001) return 60;
    if (score >= 1001) return 40;
    return Math.max((score / 1000) * 20, 0);
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
        
        <Card className="p-6 space-y-6 border bg-card text-card-foreground shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Account Information</h2>
            <p className="text-muted-foreground">
              Email: {session?.user.email}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Username: {!isEditingUsername && (profile.username || 'Not set')}
              </p>
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingUsername(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
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
                Last updated: {formatLastUpdated(profile.last_score_update)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Level Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="font-medium text-[#EAB308]">Beginner</p>
                <p className="text-sm text-muted-foreground">0 - 1,000</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#22C55E]">Intermediate</p>
                <p className="text-sm text-muted-foreground">1,001 - 2,000</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#4488EF]">Advanced</p>
                <p className="text-sm text-muted-foreground">2,001 - 3,500</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#A855F7]">Elite</p>
                <p className="text-sm text-muted-foreground">3,501 - 5,000</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#FF0000] dark:text-[#FF4444]">Monster</p>
                <p className="text-sm text-muted-foreground">5,001+</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
