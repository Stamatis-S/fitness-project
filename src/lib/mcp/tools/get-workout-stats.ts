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
  name: "get_workout_stats",
  title: "Get workout stats",
  description:
    "Return summary stats for the signed-in user over the last N days: total sets, total volume (kg*reps), unique training days, and per-category volume breakdown.",
  inputSchema: {
    days: z.number().int().min(1).max(365).default(30).describe("Look-back window in days."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data, error } = await sb
      .from("workout_logs")
      .select("workout_date, category, weight_kg, reps")
      .eq("user_id", ctx.getUserId())
      .gte("workout_date", since);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const rows = data ?? [];
    const days_set = new Set<string>();
    const byCategory: Record<string, number> = {};
    let totalVolume = 0;

    for (const r of rows as any[]) {
      days_set.add(r.workout_date);
      const vol = (r.weight_kg ?? 0) * (r.reps ?? 0);
      totalVolume += vol;
      byCategory[r.category] = (byCategory[r.category] ?? 0) + vol;
    }

    const stats = {
      window_days: days,
      total_sets: rows.length,
      total_volume_kg: Math.round(totalVolume),
      training_days: days_set.size,
      volume_by_category: byCategory,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      structuredContent: stats,
    };
  },
});
