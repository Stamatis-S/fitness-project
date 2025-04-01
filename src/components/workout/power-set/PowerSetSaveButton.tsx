
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PowerSetSaveButtonProps {
  isSubmitting: boolean;
}

export function PowerSetSaveButton({ isSubmitting }: PowerSetSaveButtonProps) {
  return (
    <div className="mt-auto">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Button 
          type="submit" 
          className="w-full h-9 text-base bg-[#E22222] hover:bg-[#C11818] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Exercise
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
