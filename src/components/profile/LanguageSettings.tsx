import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { changeLanguage } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
];

export function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const { vibrate } = useHaptic();

  const handleChange = (lng: string) => {
    vibrate("light");
    changeLanguage(lng);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-primary" />
        <div>
          <Label className="text-base font-medium">{t("profile.language")}</Label>
          <p className="text-sm text-muted-foreground">{t("profile.languageDescription")}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {languages.map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] touch-target",
              i18n.language === code
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="text-lg">{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
