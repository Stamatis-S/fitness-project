
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Check, RefreshCw, Trophy, Star, Medal, ArrowUp, ArrowDown, Camera, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from "uuid";

interface ProfileData {
  username: string | null;
  fitness_score: number;
  fitness_level: string;
  last_score_update: string;
  role: "admin" | "user";
  profile_photo_url: string | null;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function Profile() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePasswordChange = async () => {
    if (!session?.user) {
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
        email: session.user.email!,
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

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);
    try {
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: urlData.publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_photo_url: urlData.publicUrl } : null);
      
      toast.success("Profile photo updated!");
    } catch (error) {
      toast.error("Error uploading profile photo");
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!session?.user.id || !profile?.profile_photo_url) return;

    try {
      // Extract the file path from the URL
      const url = new URL(profile.profile_photo_url);
      const pathMatch = url.pathname.match(/\/profile_photos\/(.+)$/);
      if (!pathMatch) throw new Error("Could not extract file path");
      
      const filePath = pathMatch[1];

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile_photos')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update profile to remove photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_photo_url: null } : null);
      
      toast.success("Profile photo removed!");
    } catch (error) {
      toast.error("Error removing profile photo");
      console.error("Error:", error);
    }
  };

  const getProgressValue = (score: number) => {
    const levelThresholds = {
      monster: 4501,
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
        return 'text-[#FF0000]';
      case 'Elite':
        return 'text-[#A855F7]';
      case 'Advanced':
        return 'text-[#4488EF]';
      case 'Intermediate':
        return 'text-[#22C55E]';
      default:
        return 'text-[#EAB308]';
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

  const getUserInitials = () => {
    if (profile?.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    return session?.user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  if (!profile) {
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
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-[#333333]">
              {profile.profile_photo_url ? (
                <AvatarImage src={profile.profile_photo_url} alt="Profile" />
              ) : null}
              <AvatarFallback className="bg-[#333333] text-white text-xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <Button 
                size="sm" 
                className="rounded-full w-8 h-8 p-0 bg-[#333333] hover:bg-[#444444] border-0"
                onClick={handlePhotoUploadClick}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
              
              {profile.profile_photo_url && (
                <Button 
                  size="sm" 
                  className="rounded-full w-8 h-8 p-0 bg-[#333333] hover:bg-[#444444] border-0"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          <div className="text-center">
            <p className="text-white font-medium">{profile.username || session?.user.email}</p>
            <p className="text-gray-400 text-sm">{session?.user.email}</p>
          </div>
        </Card>

        {/* Account Information Card */}
        <Card className="p-4 space-y-3 border-0 bg-[#222222] rounded-lg">
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
                      onClick={handleUpdateUsername}
                      disabled={!newUsername.trim()}
                      className="h-8 bg-[#333333] hover:bg-[#444444] border-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm text-gray-300">
                      Username: {profile.username || 'Not set'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingUsername(true)}
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
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
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
                        onClick={handlePasswordChange}
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
        </Card>

        {/* Fitness Level Card */}
        <Card className="p-4 space-y-3 border-0 bg-[#222222] rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-white">Fitness Level</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRecalculateScore}
                disabled={isRecalculating}
                className="flex items-center gap-1 text-xs h-7 bg-[#333333] hover:bg-[#444444] text-white border-0"
              >
                <RefreshCw className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`text-lg font-bold ${getLevelColor(profile.fitness_level)}`}>
                  {profile.fitness_level}
                </span>
                <span className="text-sm font-medium text-white">
                  Score: {Math.round(profile.fitness_score)}
                </span>
              </div>
              <Progress 
                value={getProgressValue(profile.fitness_score)} 
                className="h-2 bg-[#333333]"
              />
              <p className="text-xs text-gray-400">
                Last updated: {formatLastUpdated(profile.last_score_update)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">Level Requirements</h3>
            <div className="grid grid-cols-3 gap-1">
              <div className="p-1 bg-[#333333] rounded">
                <div className="flex items-center gap-1">
                  <ArrowDown className="h-3 w-3 shrink-0 text-[#EAB308]" />
                  <p className="text-xs font-medium text-[#EAB308]">Beginner</p>
                </div>
                <p className="text-xs text-gray-400">0 - 1,000</p>
              </div>
              <div className="p-1 bg-[#333333] rounded">
                <div className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 shrink-0 text-[#22C55E]" />
                  <p className="text-xs font-medium text-[#22C55E]">Intermediate</p>
                </div>
                <p className="text-xs text-gray-400">1,001 - 2,000</p>
              </div>
              <div className="p-1 bg-[#333333] rounded">
                <div className="flex items-center gap-1">
                  <Medal className="h-3 w-3 shrink-0 text-[#4488EF]" />
                  <p className="text-xs font-medium text-[#4488EF]">Advanced</p>
                </div>
                <p className="text-xs text-gray-400">2,001 - 3,000</p>
              </div>
              <div className="p-1 bg-[#333333] rounded">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 shrink-0 text-[#A855F7]" />
                  <p className="text-xs font-medium text-[#A855F7]">Elite</p>
                </div>
                <p className="text-xs text-gray-400">3,001 - 4,500</p>
              </div>
              <div className="p-1 bg-[#333333] rounded">
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 shrink-0 text-[#FF0000]" />
                  <p className="text-xs font-medium text-[#FF0000]">Monster</p>
                </div>
                <p className="text-xs text-gray-400">4,501+</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
