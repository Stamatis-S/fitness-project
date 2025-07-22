
import React from "react";
import { Home, BarChart2, Bookmark, User, Trophy, Dumbbell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart2, label: "Dashboard", path: "/dashboard" },
    { icon: Dumbbell, label: "Builder", path: "/workout-builder" },
    { icon: Bookmark, label: "Saved", path: "/saved-exercises" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom">
      <nav className="flex h-full items-center justify-around px-1 sm:px-2 md:px-4 max-w-7xl mx-auto overflow-x-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === location.pathname;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center relative p-1 min-w-0 flex-1 h-full",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
              aria-label={label}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-0.5" />
                {isActive && (
                  <div className="absolute -inset-1 bg-primary/10 rounded-full -z-10" />
                )}
              </div>
              <span 
                className={cn(
                  "text-xs font-medium transition-all duration-200 truncate max-w-full",
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
