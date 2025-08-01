
import React from "react";
import { Home, BarChart2, Bookmark, User, Trophy, Dumbbell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart2, label: "Stats", path: "/dashboard" },
    { icon: Dumbbell, label: "Build", path: "/workout-builder" },
    { icon: Bookmark, label: "Saved", path: "/saved-exercises" },
    { icon: Trophy, label: "Ranks", path: "/leaderboard" },
    { icon: User, label: "Me", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-12 sm:h-14 md:h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom">
      <nav className="flex h-full items-center justify-around px-0 sm:px-1 md:px-4 max-w-7xl mx-auto overflow-x-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === location.pathname;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center relative px-0.5 py-0.5 sm:py-1 min-w-0 flex-1 h-full text-center",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              aria-label={label}
            >
              <div className="relative">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mb-0.5" />
                {isActive && (
                  <div className="absolute -inset-0.5 sm:-inset-1 bg-primary/10 rounded-full -z-10" />
                )}
              </div>
              <span 
                className={cn(
                  "text-[9px] sm:text-[10px] md:text-xs font-medium transition-all duration-200 truncate max-w-full leading-tight",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-1/2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
