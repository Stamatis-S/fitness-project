-- Fix RLS policies for workout_logs to ensure proper user access
-- First, drop the conflicting policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON workout_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON workout_logs;

-- Keep only the essential user-specific policies
-- The user should only see their own workout logs
CREATE POLICY "Users can only access their own workout logs" 
ON workout_logs FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Also fix the profiles RLS policy to be more secure
DROP POLICY IF EXISTS "Users can view public profile data of others" ON profiles;

-- Users should only see their own profile data for privacy
CREATE POLICY "Users can only view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile data" 
ON profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);