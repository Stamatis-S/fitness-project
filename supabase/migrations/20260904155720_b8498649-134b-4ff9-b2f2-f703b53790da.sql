-- 1. Fix mutable search_path on trigger functions
CREATE OR REPLACE FUNCTION public.log_workout_deletions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.workout_deletion_log (
    deleted_workout_id,
    deleted_user_id, 
    deleted_workout_date,
    deletion_source
  ) VALUES (
    OLD.id,
    OLD.user_id,
    OLD.workout_date,
    'Database deletion - check logs for source'
  );
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_bulk_workout_deletions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  deletion_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO deletion_count 
  FROM pg_stat_activity 
  WHERE query ILIKE '%DELETE FROM%workout_logs%' 
  AND state = 'active';

  INSERT INTO public.workout_deletion_log (
    deleted_workout_id,
    deleted_user_id,
    deleted_workout_date, 
    deletion_source
  ) VALUES (
    OLD.id,
    OLD.user_id,
    OLD.workout_date,
    'Bulk deletion detected - check source'
  );
  RETURN OLD;
END;
$function$;

-- 2. Restrict EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.log_workout_deletions() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.prevent_bulk_workout_deletions() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_fitness_score_trigger() FROM anon, authenticated, public;

REVOKE ALL ON FUNCTION public.calculate_fitness_score(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.calculate_fitness_score(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_workout_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_user_workout_stats() TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_comparison_stats(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_user_comparison_stats(text) TO authenticated;

-- has_role must stay executable: it is used inside RLS policies evaluated for anon and authenticated
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

-- 3. profiles: remove the overly broad "leaderboard" policy, expose a column-limited view instead
DROP POLICY IF EXISTS "Users can view limited public profile data for leaderboards" ON public.profiles;

CREATE OR REPLACE VIEW public.leaderboard_profiles
WITH (security_invoker = off) AS
SELECT id, username, fitness_score, fitness_level, profile_photo_url
FROM public.profiles;

REVOKE ALL ON public.leaderboard_profiles FROM anon, public;
GRANT SELECT ON public.leaderboard_profiles TO authenticated;
GRANT ALL ON public.leaderboard_profiles TO service_role;

-- 4. user_roles: explicit admin-only write policies with WITH CHECK
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. workout_deletion_log: audit table, no client writes
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.workout_deletion_log FROM anon, authenticated, public;
GRANT ALL ON public.workout_deletion_log TO service_role;

CREATE POLICY "No client inserts into deletion log"
ON public.workout_deletion_log FOR INSERT TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No client updates of deletion log"
ON public.workout_deletion_log FOR UPDATE TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes of deletion log"
ON public.workout_deletion_log FOR DELETE TO anon, authenticated
USING (false);