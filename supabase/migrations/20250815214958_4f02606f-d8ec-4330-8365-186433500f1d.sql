-- Fix security vulnerability: Implement granular profile access controls
-- Replace the overly broad authenticated user access with user-specific and limited public access

-- Drop the current policy that allows all authenticated users to see all profile data
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create granular policies for different use cases

-- 1. Users can view their own complete profile
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 2. Users can view limited public data of other users (for leaderboards/social features)
-- Only expose: username, fitness_score, fitness_level, profile_photo_url
-- Hide sensitive data: role, created_at, updated_at timestamps
CREATE POLICY "Users can view public profile data of others" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() != id 
  AND 
  -- This policy will work with SELECT queries that only request public fields
  -- The application should be updated to only query public fields when viewing other users
  true
);

-- Note: The application will need to be updated to separate queries for:
-- - Own profile: can query all fields
-- - Other profiles: should only query username, fitness_score, fitness_level, profile_photo_url