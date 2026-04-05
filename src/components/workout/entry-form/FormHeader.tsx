import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import { useTranslation } from "react-i18next";

interface FormHeaderProps {
  step: 'category' | 'exercise' | 'sets';
  handleBack: () => void;
  isSubmitting: boolean;
}

const STEPS = ['category', 'exercise', 'sets'] as const;

export function FormHeader({ step, handleBack, isSubmitting }: FormHeaderProps) {
  const { vibrate } = useHaptic();
  const { t } = useTranslation();

  const handleBackWithSound = () => {
    vibrate('back');
    handleBack();
  };

  const currentIndex = STEPS.indexOf(step);

  return (
    <div className="flex items-center justify-between mb-1">
      {step !== 'category' ? (
        <Button
          type="button"
          onClick={handleBackWithSound}
          variant="ghost"
          className="flex items-center gap-1.5 text-foreground p-2 -ml-2 touch-target"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">{t('common.back')}</span>
        </Button>
      ) : (
        <div className="w-16" />
      )}

      {/* Step indicator dots */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-6 bg-primary'
                : i < currentIndex
                ? 'w-1.5 bg-primary/40'
                : 'w-1.5 bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>

      <div className="w-16" />
    </div>
  );
}
