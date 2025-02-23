import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { workoutLogs, userEmail } = await req.json()
    
    if (!workoutLogs || !Array.isArray(workoutLogs)) {
      throw new Error('Invalid workout logs data')
    }

    if (!userEmail) {
      throw new Error('User email is required')
    }

    // Calculate workout stats
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentLogs = workoutLogs.filter(log => 
      new Date(log.workout_date) >= oneWeekAgo
    )

    const totalVolume = recentLogs.reduce((sum, log) => 
      sum + ((log.weight_kg || 0) * (log.reps || 0)), 0
    )
    
    const estimatedCalories = recentLogs.reduce((sum, log) => {
      const setDuration = 1.5 // minutes
      const metsValue = 6 // metabolic equivalent for weight training
      const estimatedWeight = 75 // kg, average user weight
      return sum + (setDuration * (metsValue * 3.5 * estimatedWeight) / 200)
    }, 0)

    const strengthProgress = calculateStrengthProgress(workoutLogs)

    // Create email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-top: 0;">Your Weekly Workout Report</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Weekly Summary</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>Total volume: ${Math.round(totalVolume).toLocaleString()} kg</li>
              <li>Completed sets: ${recentLogs.length}</li>
              <li>Estimated calorie burn: ${Math.round(estimatedCalories)} kcal</li>
            </ul>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Strength Progress</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              ${strengthProgress.map(progress => `<li>${progress}</li>`).join('')}
            </ul>
          </div>

          <p style="color: #4b5563; margin-top: 30px;">Keep pushing your limits! 💪</p>
        </div>
      </div>
    `

    // Send email using Supabase
    const { error } = await supabase.auth.admin.sendRawEmail({
      to: userEmail,
      from: 'noreply@yourdomain.com',
      subject: '🏋️‍♂️ Your Weekly Workout Report',
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log("Email sent successfully via Supabase SMTP")

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

function calculateStrengthProgress(workoutLogs: any[]) {
  const now = new Date()
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  
  const exerciseGroups = workoutLogs.reduce((groups: any, log: any) => {
    const exerciseName = log.custom_exercise || log.exercises?.name
    if (!exerciseName || !log.weight_kg) return groups
    
    if (!groups[exerciseName]) {
      groups[exerciseName] = []
    }
    groups[exerciseName].push(log)
    return groups
  }, {})

  const progressInsights: string[] = []

  Object.entries(exerciseGroups).forEach(([exercise, logs]: [string, any[]]) => {
    const recentLogs = logs.filter(log => new Date(log.workout_date) >= fourWeeksAgo)
    if (recentLogs.length < 2) return

    const oldestMaxWeight = Math.max(...recentLogs
      .filter(log => new Date(log.workout_date) < new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
      .map(log => log.weight_kg || 0))

    const latestMaxWeight = Math.max(...recentLogs
      .filter(log => new Date(log.workout_date) >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
      .map(log => log.weight_kg || 0))

    if (oldestMaxWeight > 0 && latestMaxWeight > 0) {
      const progressPercentage = ((latestMaxWeight - oldestMaxWeight) / oldestMaxWeight) * 100
      if (Math.abs(progressPercentage) >= 2.5) {
        progressInsights.push(
          `${exercise}: ${progressPercentage > 0 ? '+' : ''}${progressPercentage.toFixed(1)}% strength change`
        )
      }
    }
  })

  return progressInsights.length > 0 ? progressInsights : ['Start logging more workouts to track your strength progress!']
}
