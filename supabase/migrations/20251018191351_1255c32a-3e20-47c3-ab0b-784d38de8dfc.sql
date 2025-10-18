-- ============================================
-- Security Fix: Remove Unauthenticated Exercise Insertion
-- ============================================

-- Drop the dangerous policy that allows anyone to insert exercises
DROP POLICY IF EXISTS "Anyone can insert exercises" ON exercises;

-- Create admin-only insert policy (will use has_role function created below)
-- We'll add this after creating the user_roles system


-- ============================================
-- Security Fix: Implement Separate User Roles Table
-- ============================================

-- 1. Create app_role enum (keeping user_role for backward compatibility during migration)
CREATE TYPE app_role AS ENUM ('user', 'moderator', 'admin');

-- 2. Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Migrate existing roles from profiles to user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, role::text::app_role
FROM profiles
WHERE role IS NOT NULL;

-- 5. Create security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- 6. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- 7. Update existing policies to use has_role() function

-- Update workout_logs admin policy
DROP POLICY IF EXISTS "Admin users can do anything" ON workout_logs;
CREATE POLICY "Admin users can do anything"
ON workout_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update exercises admin policy
DROP POLICY IF EXISTS "Admin users can do anything" ON exercises;
CREATE POLICY "Admin users can do anything"
ON exercises FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Now create the admin-only insert policy for exercises
CREATE POLICY "Only admins can insert exercises"
ON exercises FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Remove role column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS role;