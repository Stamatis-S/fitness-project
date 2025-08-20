-- Fix leaderboard to show unique workout days instead of total entries
CREATE OR REPLACE FUNCTION public.get_user_comparison_stats(time_range text DEFAULT 'all'::text)
 RETURNS TABLE(user_id uuid, username text, total_workouts bigint, total_volume numeric, max_weight numeric, estimated_calories numeric, pr_count bigint, comparison_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  WITH workout_metrics AS (
    SELECT 
      w.user_id,
      p.username,
      COUNT(DISTINCT w.workout_date) as workout_count,  -- Changed back to DISTINCT workout_date for unique days
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
$function$