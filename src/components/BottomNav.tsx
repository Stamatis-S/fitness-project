import React from "react";
import { Home, BarChart2, Bookmark, User, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-ios-surface/95 backdrop-blur-xl border-t border-ios-separator safe-area-bottom">
      <nav className="flex h-16 items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === location.pathname;
          
          return (
            <button
              key={path}
              onClick={() => {
                vibrate('light');
                navigate(path);
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 rounded-xl transition-all duration-150 active:scale-95 active:opacity-70 touch-target",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-label={label}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors duration-150",
                isActive && "bg-primary/15"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-all duration-150",
                  isActive && "scale-105"
                )} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span 
                className={cn(
                  "text-[11px] font-medium transition-all duration-150",
                  isActive ? "opacity-100" : "opacity-60"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
