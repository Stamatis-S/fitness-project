
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { workoutLogs } = await req.json()
    
    if (!workoutLogs || !Array.isArray(workoutLogs)) {
      throw new Error('Invalid workout logs data')
    }

    // Get the authenticated user from the request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Calculate workout stats
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentLogs = workoutLogs.filter(log => 
      new Date(log.workout_date) >= oneWeekAgo
    )

    const totalWorkouts = recentLogs.length
    const totalVolume = recentLogs.reduce((sum, log) => 
      sum + ((log.weight_kg || 0) * (log.reps || 0)), 0
    )
    const maxWeight = Math.max(...recentLogs.map(log => log.weight_kg || 0))

    // Create email HTML with a more engaging design
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-top: 0;">Your Weekly Workout Report</h2>
          <p style="color: #4b5563;">Hey ${user.email},</p>
          <p style="color: #4b5563;">Here's your workout summary for the week:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
              <strong style="color: #1f2937;">Total Workouts:</strong>
              <span style="color: #4b5563; margin-left: 10px;">${totalWorkouts}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #1f2937;">Total Volume:</strong>
              <span style="color: #4b5563; margin-left: 10px;">${Math.round(totalVolume).toLocaleString()} kg</span>
            </div>
            <div>
              <strong style="color: #1f2937;">Strongest Lift:</strong>
              <span style="color: #4b5563; margin-left: 10px;">${maxWeight} kg</span>
            </div>
          </div>

          <p style="color: #4b5563; margin-top: 30px;">Keep pushing your limits! 💪</p>
        </div>
      </div>
    `

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Workout Tracker <onboarding@resend.dev>",
      to: [user.email],
      subject: "🏋️‍♂️ Your Weekly Workout Report",
      html: emailHtml,
    })

    console.log("Email sent successfully:", emailResponse)

    return new Response(
      JSON.stringify({ message: 'Workout report sent successfully!' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error: any) {
    console.error('Error sending workout report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
