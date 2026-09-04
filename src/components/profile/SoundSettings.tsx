import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX, Vibrate, VibrateOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  playFeedback,
  getSoundEnabled,
  setSoundEnabled,
  getVibrationEnabled,
  setVibrationEnabled,
  isVibrationSupported,
  triggerVibration,
} from "@/hooks/useHaptic";

export function SoundSettings() {
  const { t } = useTranslation();
  const [soundEnabled, setEnabled] = useState(getSoundEnabled);
  const [vibrationEnabled, setVibration] = useState(getVibrationEnabled);
  const vibrationSupported = isVibrationSupported();

  const handleToggle = (checked: boolean) => {
    // Play sound before changing state (so we hear it when enabling)
    if (checked) {
      setSoundEnabled(checked);
      setEnabled(checked);
      setTimeout(() => playFeedback('success'), 50);
    } else {
      playFeedback('light');
      setTimeout(() => {
        setSoundEnabled(checked);
        setEnabled(checked);
      }, 100);
    }
  };

  const handleVibrationToggle = (checked: boolean) => {
    setVibrationEnabled(checked);
    setVibration(checked);
    // Give immediate feedback when turning it on.
    if (checked) triggerVibration([18, 45, 30]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-primary" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="sound-toggle" className="text-base font-medium">
              {t("profile.soundEffects")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("profile.soundDescription")}
            </p>
          </div>
        </div>
        <Switch
          id="sound-toggle"
          checked={soundEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {vibrationEnabled && vibrationSupported ? (
            <Vibrate className="h-5 w-5 text-primary" />
          ) : (
            <VibrateOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="vibration-toggle" className="text-base font-medium">
              {t("profile.vibration")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {vibrationSupported
                ? t("profile.vibrationDescription")
                : t("profile.vibrationUnsupported")}
            </p>
          </div>
        </div>
        <Switch
          id="vibration-toggle"
          checked={vibrationEnabled && vibrationSupported}
          disabled={!vibrationSupported}
          onCheckedChange={handleVibrationToggle}
        />
      </div>
    </div>
  );
}
