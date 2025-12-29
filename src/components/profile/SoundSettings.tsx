import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX } from "lucide-react";
import { playFeedback, getSoundEnabled, setSoundEnabled } from "@/hooks/useHaptic";

export function SoundSettings() {
  const [soundEnabled, setEnabled] = useState(getSoundEnabled);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setSoundEnabled(checked);
    
    // Play a test sound when enabling
    if (checked) {
      playFeedback('light');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {soundEnabled ? (
          <Volume2 className="h-5 w-5 text-primary" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <Label htmlFor="sound-toggle" className="text-base font-medium">
            Sound Effects
          </Label>
          <p className="text-sm text-muted-foreground">
            Play sounds for actions and feedback
          </p>
        </div>
      </div>
      <Switch
        id="sound-toggle"
        checked={soundEnabled}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}