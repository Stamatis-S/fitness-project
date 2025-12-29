import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface FormHeaderProps {
  step: 'category' | 'exercise' | 'sets';
  handleBack: () => void;
  isSubmitting: boolean;
}

export function FormHeader({ step, handleBack, isSubmitting }: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      {step !== 'category' ? (
        <Button
          type="button"
          onClick={handleBack}
          variant="ghost"
          className="flex items-center gap-2 text-foreground p-3 -ml-2 touch-target"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base">Back</span>
        </Button>
      ) : (
        <div className="w-20" />
      )}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 text-center"
      >
        <h2 className="text-xl font-semibold text-foreground">
          {step === 'category' && 'Select Category'}
          {step === 'exercise' && 'Choose Exercise'}
          {step === 'sets' && 'Add Sets'}
        </h2>
      </motion.div>
      {step !== 'category' ? <div className="w-20" /> : <div className="w-20" />}
    </div>
  );
}
