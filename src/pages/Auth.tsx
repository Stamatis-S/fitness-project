
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { session } = useAuth();

  // Load saved credentials from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      // Don't load password from localStorage for security reasons
      // Instead just indicate that there are saved credentials
    }
  }, []);
  
  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        // The Supabase API doesn't support autoRefreshToken in signInWithPassword options
        // We'll handle rememberMe through localStorage instead
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      const { error } = result;
      if (error) throw error;

      // Save email to localStorage if rememberMe is checked
      if (rememberMe && !isSignUp) {
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("savedEmail");
      }

      if (isSignUp) {
        toast.success("Check your email to confirm your account!");
      } else {
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-start pt-6 md:pt-12 bg-black p-3">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full max-w-md mb-3"
        >
          <img 
            src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
            alt="Fitness Project Logo"
            className="w-32 md:w-40 mx-auto hover-brightness"
          />
        </motion.div>
        
        <Card className="w-full max-w-md p-3 space-y-2 animate-fade-up bg-[#222222] border-0">
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center mb-1"
          >
            <h1 className="text-xl font-bold text-white">
              FITNESS PROJECT
            </h1>
          </motion.div>

          <form onSubmit={handleAuth} className="space-y-2">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-1"
            >
              <Label htmlFor="email" className="text-sm text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="compact-input h-9 hover-brightness focus:ring-2 focus:ring-[#E22222]/50"
              />
            </motion.div>

            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="space-y-1"
            >
              <Label htmlFor="password" className="text-sm text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="compact-input h-9 hover-brightness focus:ring-2 focus:ring-[#E22222]/50"
              />
            </motion.div>

            {!isSignUp && (
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex items-center space-x-2"
              >
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={checked => setRememberMe(checked === true)}
                />
                <Label htmlFor="rememberMe" className="text-xs text-gray-400">
                  Remember me
                </Label>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-[#E22222] hover:bg-[#C11818] text-white h-9 mt-1 hover-scale" 
                disabled={isLoading}
              >
                {isLoading
                  ? "Loading..."
                  : isSignUp
                  ? "Create Account"
                  : "Log In"}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="text-center pb-1"
          >
            <Button
              type="button"
              variant="link"
              onClick={toggleSignUp}
              className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
            >
              {isSignUp
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </Button>
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  );
}
