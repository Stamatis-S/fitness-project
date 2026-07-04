import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

const CATEGORIES = [
  "ΣΤΗΘΟΣ",
  "ΠΛΑΤΗ",
  "ΔΙΚΕΦΑΛΑ",
  "ΤΡΙΚΕΦΑΛΑ",
  "ΩΜΟΙ",
  "ΠΟΔΙΑ",
  "ΚΟΡΜΟΣ",
  "CARDIO",
  "POWER SETS",
] as const;

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "log_workout_set",
  title: "Log a workout set",
  description:
    "Log a single workout set for the signed-in user. Provide the exercise name (uppercase, no accents), one of the fixed Greek category codes (e.g. ΣΤΗΘΟΣ, ΠΛΑΤΗ, ΠΟΔΙΑ), the set number, weight in kg, and reps.",
  inputSchema: {
    exercise_name: z.string().trim().min(1).describe("Exercise name, e.g. 'BENCH PRESS'."),
    category: z.enum(CATEGORIES).describe("Muscle-group category (Greek code)."),
    set_number: z.number().int().min(1).max(50),
    weight_kg: z.number().min(0).max(1000),
    reps: z.number().int().min(0).max(500),
    workout_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Date in YYYY-MM-DD. Defaults to today (UTC) if omitted."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (args, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);

    // Try to match a known exercise; otherwise store as custom_exercise.
    const { data: existing } = await sb
      .from("exercises")
      .select("id, name")
      .ilike("name", args.exercise_name)
      .eq("category", args.category)
      .maybeSingle();

    const insertRow = {
      user_id: ctx.getUserId()!,
      category: args.category,
      set_number: args.set_number,
      weight_kg: args.weight_kg,
      reps: args.reps,
      workout_date: args.workout_date ?? new Date().toISOString().slice(0, 10),
      exercise_id: existing?.id ?? null,
      custom_exercise: existing ? null : args.exercise_name.toUpperCase(),
    };

    const { data, error } = await sb.from("workout_logs").insert(insertRow).select().single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [{ type: "text", text: `Logged set #${data.set_number} of ${args.exercise_name}: ${data.weight_kg}kg x ${data.reps}` }],
      structuredContent: { row: data },
    };
  },
});
