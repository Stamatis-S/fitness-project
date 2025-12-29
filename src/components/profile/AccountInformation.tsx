
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useHaptic } from "@/hooks/useHaptic";

interface AccountInformationProps {
  userId: string;
  username: string | null;
  email: string;
  onUsernameUpdate: (newUsername: string) => void;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export function AccountInformation({ userId, username, email, onUsernameUpdate }: AccountInformationProps) {
  const queryClient = useQueryClient();
  const { vibrate } = useHaptic();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username || "");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const handleUpdateUsername = async () => {
    if (!userId) {
      toast.error("You must be logged in to update your username");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', userId);

      if (error) throw error;

      onUsernameUpdate(newUsername);
      setIsEditingUsername(false);
      
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-stats'] });
      
      toast.success("Username updated successfully!");
    } catch (error) {
      toast.error("Error updating username");
      console.error("Error:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (!userId) {
      toast.error("You must be logged in to change your password");
      return;
    }

    // Form validation
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      // First authenticate with current password to verify
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      // Reset form and close password change section
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      setIsChangingPassword(false);
      
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Error updating password");
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-white">Account Information</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {isEditingUsername ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="h-8 text-sm bg-[#333333] border-[#444444]"
                placeholder="Enter new username"
              />
              <Button
                size="sm"
                onClick={() => {
                  vibrate('light');
                  handleUpdateUsername();
                }}
                disabled={!newUsername.trim()}
                className="h-8 bg-[#333333] hover:bg-[#444444] border-0"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-gray-300">
                Username: {username || 'Not set'}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  vibrate('light');
                  setIsEditingUsername(true);
                }}
                className="h-6 p-1"
              >
                <Edit2 className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          )}
        </div>
        
        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              vibrate('light');
              setIsChangingPassword(!isChangingPassword);
            }}
            className="w-full flex justify-between items-center text-sm h-9 bg-[#333333] hover:bg-[#444444] text-white border-0"
          >
            <span>Change Password</span>
            <Lock className="h-3 w-3" />
          </Button>
          
          {isChangingPassword && (
            <div className="mt-3 space-y-2 p-3 bg-[#333333] rounded-md">
              <Input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="bg-[#444444] border-[#555555] h-8 text-sm"
              />
              <Input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="bg-[#444444] border-[#555555] h-8 text-sm"
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                className="bg-[#444444] border-[#555555] h-8 text-sm"
              />
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    vibrate('light');
                    setIsChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: ""
                    });
                  }}
                  className="flex-1 h-8 bg-transparent hover:bg-[#444444] text-gray-300 border-[#555555]"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    vibrate('light');
                    console.log('Update button clicked', { passwordForm });
                    handlePasswordChange();
                  }}
                  disabled={!passwordForm.currentPassword || 
                           !passwordForm.newPassword || 
                           !passwordForm.confirmNewPassword ||
                           passwordForm.newPassword !== passwordForm.confirmNewPassword}
                  className="flex-1 h-8 bg-[#4488EF] hover:bg-[#3377DD] border-0"
                >
                  Update
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
