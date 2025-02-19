
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@3.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
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

    // Get request body
    const { workoutLogs } = await req.json()

    // Generate report content
    const generateReportContent = (logs: any[]) => {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const recentLogs = logs.filter((log: any) => new Date(log.workout_date) >= oneWeekAgo)
      
      // Calculate total volume
      const totalVolume = recentLogs.reduce((sum: number, log: any) => 
        sum + ((log.weight_kg || 0) * (log.reps || 0)), 0)
      
      // Group exercises
      const exerciseGroups = recentLogs.reduce((groups: any, log: any) => {
        const name = log.custom_exercise || log.exercises?.name || 'Unknown'
        if (!groups[name]) groups[name] = []
        groups[name].push(log)
        return groups
      }, {})

      // Generate exercise summaries
      const exerciseSummaries = Object.entries(exerciseGroups).map(([name, logs]: [string, any[]]) => {
        const maxWeight = Math.max(...logs.map(log => log.weight_kg || 0))
        const totalSets = logs.length
        return `${name}: ${totalSets} sets, max weight: ${maxWeight}kg`
      })

      return `
        <h2>Weekly Workout Report</h2>
        <p>Here's your workout summary for the past week:</p>
        
        <h3>Overview</h3>
        <ul>
          <li>Total Volume: ${Math.round(totalVolume).toLocaleString()}kg</li>
          <li>Total Sets: ${recentLogs.length}</li>
          <li>Unique Exercises: ${Object.keys(exerciseGroups).length}</li>
        </ul>

        <h3>Exercise Details</h3>
        <ul>
          ${exerciseSummaries.map(summary => `<li>${summary}</li>`).join('\n')}
        </ul>

        <p>Keep up the great work! 💪</p>
      `
    }

    // Send email - using the user's email as both from and to address for testing
    const { error: emailError } = await resend.emails.send({
      from: `${user.email}`,  // Using the user's email as the from address
      to: [user.email],
      subject: 'Your Weekly Workout Report',
      html: generateReportContent(workoutLogs),
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      throw emailError
    }

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
      JSON.stringify({ 
        error: error.message,
        details: "To send emails to other addresses, please verify a domain at resend.com/domains"
      }),
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
