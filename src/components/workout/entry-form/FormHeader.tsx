
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
    <div className="flex items-center justify-between mb-1">
      {step !== 'category' && (
        <Button
          type="button"
          onClick={handleBack}
          variant="ghost"
          className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 text-center"
      >
        <h2 className="text-lg font-semibold text-white">
          {step === 'category' && 'Select Category'}
          {step === 'exercise' && 'Choose Exercise'}
          {step === 'sets' && 'Add Sets'}
        </h2>
      </motion.div>
      {step !== 'category' && <div className="w-[60px]" />}
    </div>
  );
}
