
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: EmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Gym App <onboarding@resend.dev>",
      to: [email],
      subject: "🏋️‍♂️ Workout Cycle Complete - Payment Reminder",
      html: `
        <h1>Congratulations on completing your workout cycle, ${name}!</h1>
        <p>You've reached Day 12 of your workout cycle. It's time for your gym payment!</p>
        <p>Keep up the great work! 💪</p>
        <br>
        <p>Best regards,<br>Your Gym Team</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
