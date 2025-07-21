import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { WorkoutBuilder as WorkoutBuilderComponent } from "@/components/workout-builder/WorkoutBuilder";

export default function WorkoutBuilder() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <WorkoutBuilderComponent />
    </PageTransition>
  );
}