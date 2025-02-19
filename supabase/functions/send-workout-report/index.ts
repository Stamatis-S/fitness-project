
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey!,
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Get request body with workout logs
    const { workoutLogs } = await req.json()

    // Format workout data for email
    const formatWorkoutData = (logs: any[]) => {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Filter for recent logs
      const recentLogs = logs.filter(log => new Date(log.workout_date) >= oneWeekAgo)
      
      // Calculate totals
      const totalVolume = recentLogs.reduce((sum, log) => 
        sum + ((log.weight_kg || 0) * (log.reps || 0)), 0)
      const totalSets = recentLogs.length
      
      // Group by category
      const categoryGroups = recentLogs.reduce((groups: any, log) => {
        if (!groups[log.category]) {
          groups[log.category] = []
        }
        groups[log.category].push(log)
        return groups
      }, {})

      // Generate category summaries
      const categorySummaries = Object.entries(categoryGroups).map(([category, logs]: [string, any[]]) => {
        const exercises = logs.reduce((acc: any, log) => {
          const name = log.custom_exercise || log.exercises?.name || 'Unknown'
          if (!acc[name]) {
            acc[name] = {
              sets: 0,
              maxWeight: 0,
              totalVolume: 0
            }
          }
          acc[name].sets++
          acc[name].maxWeight = Math.max(acc[name].maxWeight, log.weight_kg || 0)
          acc[name].totalVolume += (log.weight_kg || 0) * (log.reps || 0)
          return acc
        }, {})

        return {
          category,
          exercises: Object.entries(exercises).map(([name, stats]: [string, any]) => ({
            name,
            ...stats
          }))
        }
      })

      return { totalVolume, totalSets, categorySummaries }
    }

    const stats = formatWorkoutData(workoutLogs)

    // Generate HTML email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Weekly Workout Report</h1>
        <p>Here's your workout summary for the past week:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Overall Stats</h2>
          <ul style="list-style: none; padding: 0;">
            <li>📊 Total Volume: ${Math.round(stats.totalVolume).toLocaleString()}kg</li>
            <li>🎯 Total Sets: ${stats.totalSets}</li>
          </ul>
        </div>

        ${stats.categorySummaries.map(cat => `
          <div style="margin: 20px 0;">
            <h3 style="color: #4b5563;">${cat.category}</h3>
            ${cat.exercises.map(ex => `
              <div style="margin-left: 20px; margin-bottom: 10px;">
                <strong>${ex.name}</strong>
                <ul style="margin: 5px 0;">
                  <li>Sets: ${ex.sets}</li>
                  <li>Max Weight: ${ex.maxWeight}kg</li>
                  <li>Total Volume: ${Math.round(ex.totalVolume).toLocaleString()}kg</li>
                </ul>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <p style="margin-top: 30px;">Keep pushing your limits! 💪</p>
      </div>
    `

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Workout Tracker <onboarding@resend.dev>",
      to: [user.email],
      subject: "🏋️‍♂️ Your Weekly Workout Report",
      html: emailContent,
    })

    console.log("Email sent successfully:", emailResponse)

    return new Response(
      JSON.stringify({ message: 'Report sent successfully' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error: any) {
    console.error('Error sending report:', error)
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
