import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Smooth iOS-style spring config
const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// Fade variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

// Slide up variants
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: springConfig
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.15 }
  }
};

// Scale variants
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: springConfig
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Stagger item variants
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: springConfig
  }
};

// Animated container with stagger effect
interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  stagger?: boolean;
  delay?: number;
}

export const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ children, className, stagger = false, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={stagger ? staggerContainerVariants : undefined}
        transition={stagger ? { delayChildren: delay } : undefined}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedContainer.displayName = "AnimatedContainer";

// Animated item for use inside AnimatedContainer
interface AnimatedItemProps extends HTMLMotionProps<"div"> {
  variant?: "fade" | "slideUp" | "scale";
}

export const AnimatedItem = React.forwardRef<HTMLDivElement, AnimatedItemProps>(
  ({ children, className, variant = "slideUp", ...props }, ref) => {
    const variants = {
      fade: fadeVariants,
      slideUp: staggerItemVariants,
      scale: scaleVariants,
    };

    return (
      <motion.div
        ref={ref}
        variants={variants[variant]}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedItem.displayName = "AnimatedItem";

// Animated card with hover effects
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  hoverScale?: boolean;
  tapScale?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hoverScale = true, tapScale = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        whileHover={hoverScale ? { scale: 1.01, y: -2 } : undefined}
        whileTap={tapScale ? { scale: 0.98 } : undefined}
        transition={springConfig}
        className={cn(
          "rounded-ios-lg border-0 bg-ios-surface text-card-foreground",
          "transition-shadow duration-200",
          hoverScale && "hover:shadow-lg hover:shadow-primary/5",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

// Animated button with press effect
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "subtle";
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

// Page transition wrapper
interface PageTransitionWrapperProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
}

export const PageTransitionWrapper = React.forwardRef<HTMLDivElement, PageTransitionWrapperProps>(
  ({ children, className, direction = "up", ...props }, ref) => {
    const directionOffset = {
      up: { y: 20, x: 0 },
      down: { y: -20, x: 0 },
      left: { y: 0, x: 20 },
      right: { y: 0, x: -20 },
    };

    return (
      <motion.div
        ref={ref}
        initial={{ 
          opacity: 0, 
          ...directionOffset[direction]
        }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          y: 0 
        }}
        exit={{ 
          opacity: 0,
          ...directionOffset[direction]
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
        }}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
PageTransitionWrapper.displayName = "PageTransitionWrapper";

// Number counter animation
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 0.5,
  className,
  formatter = (v) => Math.round(v).toString(),
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(startValue + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {formatter(displayValue)}
    </span>
  );
};

// Pulse animation for active states
export const PulseIndicator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.span
      className={cn("inline-block w-2 h-2 rounded-full bg-primary", className)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Skeleton loader with shimmer effect
export const AnimatedSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.div
      className={cn(
        "bg-muted rounded-ios relative overflow-hidden",
        className
      )}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};
