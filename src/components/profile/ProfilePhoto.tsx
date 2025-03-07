
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from "uuid";

interface ProfilePhotoProps {
  profilePhotoUrl: string | null;
  userId: string;
  username: string | null;
  email: string;
  onPhotoUpdate: (url: string | null) => void;
}

export function ProfilePhoto({ profilePhotoUrl, userId, username, email, onPhotoUpdate }: ProfilePhotoProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUserInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
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
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state via the callback
      onPhotoUpdate(urlData.publicUrl);
      
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
    if (!userId || !profilePhotoUrl) return;

    try {
      // Extract the file path from the URL
      const url = new URL(profilePhotoUrl);
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
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state via the callback
      onPhotoUpdate(null);
      
      toast.success("Profile photo removed!");
    } catch (error) {
      toast.error("Error removing profile photo");
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border-2 border-[#333333]">
        {profilePhotoUrl ? (
          <AvatarImage src={profilePhotoUrl} alt="Profile" />
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
        
        {profilePhotoUrl && (
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
  );
}
