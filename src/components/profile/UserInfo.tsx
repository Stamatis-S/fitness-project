
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface UserInfoProps {
  session: Session | null;
  username: string | null;
  isEditingUsername: boolean;
  newUsername: string;
  setIsEditingUsername: (value: boolean) => void;
  setNewUsername: (value: string) => void;
  onUpdateUsername: () => void;
}

export function UserInfo({
  session,
  username,
  isEditingUsername,
  newUsername,
  setIsEditingUsername,
  setNewUsername,
  onUpdateUsername,
}: UserInfoProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Account Information</h2>
      <p className="text-muted-foreground">
        Email: {session?.user.email}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">
          Username: {!isEditingUsername && (username || 'Not set')}
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
              onClick={onUpdateUsername}
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
  );
}
