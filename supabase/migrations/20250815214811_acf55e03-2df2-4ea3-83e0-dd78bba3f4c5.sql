-- Fix security vulnerability: Restrict profile access to authenticated users only
-- Replace the overly permissive "Anyone can view profiles" policy

-- First, drop the insecure policy that allows public access
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create a new secure policy that requires authentication
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- This ensures:
-- 1. Only authenticated users can access profile data
-- 2. Legitimate features like leaderboards still work for logged-in users
-- 3. Anonymous/unauthenticated access is completely blocked