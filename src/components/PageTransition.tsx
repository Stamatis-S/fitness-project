import React, { useMemo } from "react";
import { ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // Lighter, faster transition on mobile to keep the UI responsive.
  // Skip animation entirely if the user prefers reduced motion.
  const variants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }
    if (isMobile) {
      return {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      };
    }
    return {
      initial: { opacity: 0, y: 12, scale: 0.99 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 260, damping: 25, mass: 0.5 },
      },
      exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
    };
  }, [isMobile, prefersReducedMotion]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants as any}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
