import React from "react";
import { Home, BarChart2, Bookmark, User, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";

const HIDDEN_PATHS = ['/auth', '/install'];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vibrate } = useHaptic();

  // Hide BottomNav on auth, install, and 404 pages
  const shouldHide = HIDDEN_PATHS.includes(location.pathname) || 
    !['/', '/dashboard', '/saved-exercises', '/leaderboard', '/profile', '/workout-plan', '/templates'].includes(location.pathname);
  
  if (shouldHide) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart2, label: "Stats", path: "/dashboard" },
    { icon: Bookmark, label: "Saved", path: "/saved-exercises" },
    { icon: Trophy, label: "Ranks", path: "/leaderboard" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className="fixed bottom-4 left-4 right-4 z-50"
    >
      <nav className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-white/10 bg-card/80 backdrop-blur-2xl shadow-2xl">
        {/* Gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
        
        <div className="relative flex h-16 items-center justify-around px-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = path === location.pathname;
            
            return (
              <motion.button
                key={path}
                onClick={() => {
                  vibrate('light');
                  navigate(path);
                }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 rounded-xl transition-colors duration-200 touch-target",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
                aria-label={label}
              >
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute -inset-3 rounded-xl bg-primary/15 blur-sm"
                      />
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative p-1.5"
                  >
                    <Icon 
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </motion.div>
                </div>
                <motion.span 
                  animate={{ 
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? 0 : 2
                  }}
                  className={cn(
                    "text-[10px] font-semibold tracking-wide",
                    isActive && "text-primary"
                  )}
                >
                  {label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
        
        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </nav>
    </motion.div>
  );
}
