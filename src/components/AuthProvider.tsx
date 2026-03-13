import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const pathnameRef = useRef(window.location.pathname);

  // Keep ref in sync with current pathname
  useEffect(() => {
    const updatePathname = () => {
      pathnameRef.current = window.location.pathname;
    };
    // Listen for popstate to catch browser navigation
    window.addEventListener('popstate', updatePathname);
    // Also update on any render (covers programmatic navigation)
    updatePathname();
    return () => window.removeEventListener('popstate', updatePathname);
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setIsLoading(false);

      const publicRoutes = ['/auth'];
      const isPublicRoute = publicRoutes.includes(pathnameRef.current);

      if (!session && !isPublicRoute) {
        if (event === 'SIGNED_OUT') {
          toast.error("Session expired. Please log in again.");
        }
        navigate('/auth');
      } else if (session && isPublicRoute) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
