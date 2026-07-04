import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_recent_workouts",
  title: "List recent workouts",
  description:
    "List the signed-in user's most recent workout sets, newest first. Each row is one logged set (exercise, category, weight in kg, reps, set number, date).",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .default(50)
      .describe("Maximum number of sets to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("workout_logs")
      .select("id, workout_date, category, custom_exercise, exercise_id, set_number, weight_kg, reps, exercises(name)")
      .eq("user_id", ctx.getUserId())
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      date: r.workout_date,
      category: r.category,
      exercise: r.custom_exercise ?? r.exercises?.name ?? "Unknown",
      set_number: r.set_number,
      weight_kg: r.weight_kg,
      reps: r.reps,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { rows },
    };
  },
});
