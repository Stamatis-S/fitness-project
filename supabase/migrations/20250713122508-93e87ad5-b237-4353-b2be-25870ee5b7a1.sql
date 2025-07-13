-- Fix security warnings by setting proper search paths for functions

-- Update get_user_workout_stats function with secure search path
CREATE OR REPLACE FUNCTION public.get_user_workout_stats()
 RETURNS TABLE(user_id uuid, username text, total_workouts bigint, max_weight numeric, total_volume numeric, favorite_category text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN QUERY
    WITH workout_metrics AS (
        SELECT 
            w.user_id,
            p.username,
            COUNT(DISTINCT w.workout_date) as workout_count,
            MAX(w.weight_kg) as max_weight,
            SUM(w.weight_kg * w.reps) as total_volume,
            mode() WITHIN GROUP (ORDER BY w.category) as most_used_category
        FROM workout_logs w
        JOIN profiles p ON w.user_id = p.id
        WHERE w.weight_kg IS NOT NULL AND w.reps IS NOT NULL
        GROUP BY w.user_id, p.username
    )
    SELECT 
        wm.user_id,
        COALESCE(wm.username, 'Anonymous User') as username,
        wm.workout_count as total_workouts,
        COALESCE(wm.max_weight, 0) as max_weight,
        COALESCE(wm.total_volume, 0) as total_volume,
        wm.most_used_category as favorite_category
    FROM workout_metrics wm
    ORDER BY wm.total_volume DESC;
END;
$function$;

-- Update get_user_comparison_stats function with secure search path
CREATE OR REPLACE FUNCTION public.get_user_comparison_stats(time_range text DEFAULT 'all'::text)
 RETURNS TABLE(user_id uuid, username text, total_workouts bigint, total_volume numeric, max_weight numeric, estimated_calories numeric, pr_count bigint, comparison_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  WITH workout_metrics AS (
    SELECT 
      w.user_id,
      p.username,
      COUNT(DISTINCT w.workout_date) as workout_count,
      SUM(w.weight_kg * w.reps) as total_volume,
      MAX(w.weight_kg) as max_weight,
      -- Estimate calories: METs value * 3.5 * user weight (assumed 75kg) * minutes / 200
      SUM(w.reps * 1.5 * (6 * 3.5 * 75) / 200) as calories,
      -- Count PRs (sessions where weight > previous max for that exercise)
      COUNT(DISTINCT CASE 
        WHEN w.weight_kg > (
          SELECT MAX(w2.weight_kg)
          FROM workout_logs w2
          WHERE w2.user_id = w.user_id
            AND w2.workout_date < w.workout_date
            AND (
              (w2.exercise_id = w.exercise_id AND w2.exercise_id IS NOT NULL)
              OR (w2.custom_exercise = w.custom_exercise AND w2.custom_exercise IS NOT NULL)
            )
        ) THEN w.workout_date
        ELSE NULL
      END) as personal_records,
      CURRENT_TIMESTAMP as snapshot_date
    FROM workout_logs w
    JOIN profiles p ON w.user_id = p.id
    WHERE w.weight_kg IS NOT NULL 
      AND w.reps IS NOT NULL
      AND CASE 
        WHEN time_range = 'week' THEN w.workout_date >= CURRENT_DATE - INTERVAL '7 days'
        WHEN time_range = 'month' THEN w.workout_date >= CURRENT_DATE - INTERVAL '30 days'
        ELSE true
      END
    GROUP BY w.user_id, p.username
  )
  SELECT 
    wm.user_id,
    COALESCE(wm.username, 'Anonymous User') as username,
    wm.workout_count as total_workouts,
    COALESCE(wm.total_volume, 0) as total_volume,
    COALESCE(wm.max_weight, 0) as max_weight,
    COALESCE(wm.calories, 0) as estimated_calories,
    COALESCE(wm.personal_records, 0) as pr_count,
    wm.snapshot_date as comparison_date
  FROM workout_metrics wm
  ORDER BY wm.total_volume DESC;
END;
$function$;

-- Update calculate_fitness_score function with secure search path
CREATE OR REPLACE FUNCTION public.calculate_fitness_score(user_id_param uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    total_score NUMERIC;
    new_level TEXT;
    decay_factor NUMERIC := 0.04;
    avg_weekly_workouts NUMERIC;
    consistency_bonus NUMERIC;
    max_weekly_target NUMERIC := 5.0;
    scaling_factor NUMERIC := 0.3;
    last_workout_days DATE[];
BEGIN
    -- Get the last 12 unique workout days
    SELECT ARRAY(
        SELECT DISTINCT workout_date::date
        FROM workout_logs
        WHERE user_id = user_id_param
        ORDER BY workout_date::date DESC
        LIMIT 12
    ) INTO last_workout_days;
    
    -- Calculate score with time decay and workout points for the last 12 workout days
    WITH workout_points AS (
        SELECT 
            workout_date,
            -- Calculate base workout points with square root and scaling
            POWER(COALESCE(weight_kg * reps, 0), 0.5) * scaling_factor as base_points,
            -- Calculate age of workout in days
            EXTRACT(DAY FROM (CURRENT_DATE::timestamp - workout_date::timestamp)) as workout_age
        FROM workout_logs
        WHERE user_id = user_id_param
        AND workout_date::date = ANY(last_workout_days)
        AND weight_kg IS NOT NULL 
        AND reps IS NOT NULL
    ),
    decayed_scores AS (
        SELECT 
            -- Apply time decay factor to workout points
            base_points / (1 + decay_factor * workout_age) as decayed_points,
            -- Group by week for consistency calculation
            DATE_TRUNC('week', workout_date) as workout_week
        FROM workout_points
    ),
    weekly_stats AS (
        SELECT 
            workout_week,
            COUNT(DISTINCT workout_week) as workouts_this_week
        FROM decayed_scores
        GROUP BY workout_week
    )
    SELECT 
        -- Calculate main score from decayed workout points
        COALESCE(SUM(decayed_points), 0) +
        -- Add consistency bonus based on average weekly workouts
        CASE 
            WHEN AVG(workouts_this_week) > 0 THEN
                150 * (1 - ABS(AVG(workouts_this_week) - max_weekly_target) / max_weekly_target)
            ELSE 0
        END
    INTO total_score
    FROM decayed_scores, weekly_stats;

    -- Ensure minimum score is 0
    total_score := GREATEST(total_score, 0);

    -- Determine level based on lowered thresholds (reduced by 5% for top 3 levels)
    new_level := 
        CASE
            WHEN total_score >= 4940 THEN 'Legend'    -- Reduced by 5% from 5200
            WHEN total_score >= 3705 THEN 'Elite'     -- Reduced by 5% from 3900
            WHEN total_score >= 2470 THEN 'Advanced'  -- Reduced by 5% from 2600
            WHEN total_score >= 1300 THEN 'Intermediate' -- Unchanged
            WHEN total_score >= 400 THEN 'Novice'     -- Unchanged
            ELSE 'Beginner'
        END;

    -- Update the user's profile
    UPDATE profiles
    SET 
        fitness_score = total_score,
        fitness_level = new_level,
        last_score_update = CURRENT_TIMESTAMP
    WHERE id = user_id_param;

    RETURN total_score;
END;
$function$;

-- Update handle_new_user function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$function$;

-- Update update_fitness_score_trigger function with secure search path
CREATE OR REPLACE FUNCTION public.update_fitness_score_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    PERFORM calculate_fitness_score(NEW.user_id);
    RETURN NEW;
END;
$function$;