
import { useState } from "react";
import { Check, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";

interface AccountInformationProps {
  session: Session | null;
  username: string | null;
  setUsername: (username: string) => void;
}

export function AccountInformation({ session, username, setUsername }: AccountInformationProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username || "");
  const queryClient = useQueryClient();

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

      setUsername(newUsername);
      setIsEditingUsername(false);
      
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-stats'] });
      
      toast.success("Username updated successfully!");
    } catch (error) {
      toast.error("Error updating username");
      console.error("Error:", error);
    }
  };

  return (
    <Card className="p-4 space-y-3 border bg-card text-card-foreground shadow-sm">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Email</Label>
            <span className="font-medium truncate max-w-[200px]">
              {session?.user.email}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Username</Label>
            {isEditingUsername ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-7 max-w-[150px] text-xs"
                  placeholder="Enter username"
                />
                <Button
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleUpdateUsername}
                  disabled={!newUsername.trim()}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {username || 'Not set'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsEditingUsername(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
