import { auth, defineMcp } from "@lovable.dev/mcp-js";
import logWorkoutSet from "./tools/log-workout-set";
import listRecentWorkouts from "./tools/list-recent-workouts";
import getWorkoutStats from "./tools/get-workout-stats";
import listWorkoutTemplates from "./tools/list-templates";

// Build the OAuth issuer from the project ref (Vite inlines this at build time
// so it stays import-safe at cold start and during manifest extraction).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fittrack-mcp",
  title: "FitTrack MCP",
  version: "0.1.0",
  instructions:
    "Tools for the FitTrack fitness tracker. Use `log_workout_set` to add a set, `list_recent_workouts` to see recent sets, `get_workout_stats` for a volume summary, and `list_workout_templates` to see saved templates. Category values are fixed Greek codes (ΣΤΗΘΟΣ, ΠΛΑΤΗ, ΔΙΚΕΦΑΛΑ, ΤΡΙΚΕΦΑΛΑ, ΩΜΟΙ, ΠΟΔΙΑ, ΚΟΡΜΟΣ, CARDIO, POWER SETS). Exercise names are uppercase without accents.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [logWorkoutSet, listRecentWorkouts, getWorkoutStats, listWorkoutTemplates],
});
