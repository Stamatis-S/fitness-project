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
    !['/', '/dashboard', '/saved-exercises', '/leaderboard', '/profile', '/workout-plan'].includes(location.pathname);
  
  if (shouldHide) {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart2, label: "Stats", path: "/dashboard" },
    { icon: Bookmark, label: "Saved", path: "/saved-exercises" },
    { icon: Trophy, label: "Ranks", path: "/leaderboard" },
    { icon: User, label: "Me", path: "/profile" },
  ];

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-ios-surface/95 backdrop-blur-xl border-t border-ios-separator safe-area-bottom"
    >
      <nav className="flex h-16 items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === location.pathname;
          
          return (
            <motion.button
              key={path}
              onClick={() => {
                vibrate('light');
                navigate(path);
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 rounded-xl transition-colors duration-150 touch-target",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={label}
            >
              <div className="relative">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute inset-0 -m-1.5 rounded-xl bg-primary/15"
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative p-1.5"
                >
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
              </div>
              <motion.span 
                animate={{ opacity: isActive ? 1 : 0.6 }}
                className="text-[11px] font-medium"
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
}
