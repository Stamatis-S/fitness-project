-- Fix security vulnerability: Remove public access to workout data
-- Drop the dangerous policy that allows everyone to view all workout logs

DROP POLICY IF EXISTS "Workouts are viewable by everyone" ON public.workout_logs;

-- Verify that secure policies remain in place:
-- "Users can view their own workout logs" - allows users to see only their own data
-- "Users can manage their own workouts" - allows users to manage only their own data
-- "Admin users can do anything" - allows admin access when needed

-- This ensures:
-- 1. Private workout data is no longer publicly accessible
-- 2. Users can still view and manage their own workout logs
-- 3. Admin functionality is preserved
-- 4. Leaderboard and comparison features still work (they use specific user comparisons)