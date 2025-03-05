
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface DashboardAuthCheckProps {
  children: React.ReactNode;
}

export function DashboardAuthCheck({ children }: DashboardAuthCheckProps) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
