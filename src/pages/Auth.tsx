
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp) {
        toast.success("Check your email to confirm your account!");
      } else {
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 md:pt-16 bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md mb-4">
        <img 
          src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
          alt="Fitness Project Logo"
          className="w-40 md:w-48 mx-auto"
        />
      </div>
      
      <Card className="w-full max-w-md p-3 space-y-3 animate-fade-up">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">
            Fitness Project
          </h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : isSignUp
              ? "Create Account"
              : "Log In"}
          </Button>
        </form>

        <div className="text-center pb-1">
          <Button
            type="button"
            variant="link"
            onClick={toggleSignUp}
            className="text-sm text-primary hover:text-primary/80"
          >
            {isSignUp
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
