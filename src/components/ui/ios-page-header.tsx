import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface IOSPageHeaderProps {
  title: string;
  backPath?: string;
  rightElement?: React.ReactNode;
}

export function IOSPageHeader({ title, backPath = "/", rightElement }: IOSPageHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-ios-separator"
    >
      <button
        className="flex items-center gap-1.5 text-primary active:opacity-70 transition-opacity touch-target"
        onClick={() => navigate(backPath)}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base font-medium">Back</span>
      </button>
      
      <h1 className="text-lg font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>
      
      <div className="min-w-[60px] flex justify-end">
        {rightElement}
      </div>
    </motion.div>
  );
}
