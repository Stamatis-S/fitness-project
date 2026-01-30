import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // VERIFY AUTHENTICATION
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Create client with user's auth token to verify identity
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify JWT and get user claims
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.error('Failed to verify JWT:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    const userId = claimsData.claims.sub as string
    const userEmail = claimsData.claims.email as string

    if (!userEmail) {
      console.error('User email not found in claims')
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Use service role client to fetch data server-side
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // FETCH DATA SERVER-SIDE instead of accepting from client
    const { data: workoutLogs, error: logsError } = await supabase
      .from('workout_logs')
      .select(`
        *,
        exercises (name)
      `)
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
    
    if (logsError) {
      console.error('Error fetching workout logs:', logsError)
      throw new Error('Failed to fetch workout logs')
    }

    if (!workoutLogs || workoutLogs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No workout data to report' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
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
    const weightProgressions = calculateWeightProgressions(workoutLogs)

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
            <h3 style="color: #1f2937; margin-top: 0;">Weight Progressions</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              ${weightProgressions.map(progress => `<li>${progress}</li>`).join('')}
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

    console.log("Email sent successfully to authenticated user")

    return new Response(
      JSON.stringify({ message: 'Workout report sent successfully!' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error sending workout report:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
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

interface WorkoutLog {
  workout_date: string;
  weight_kg: number | null;
  reps: number | null;
  custom_exercise: string | null;
  exercises: { name: string } | null;
}

function calculateStrengthProgress(workoutLogs: WorkoutLog[]) {
  const now = new Date()
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  
  const exerciseGroups = workoutLogs.reduce((groups: Record<string, WorkoutLog[]>, log: WorkoutLog) => {
    const exerciseName = log.custom_exercise || log.exercises?.name
    if (!exerciseName || !log.weight_kg) return groups
    
    if (!groups[exerciseName]) {
      groups[exerciseName] = []
    }
    groups[exerciseName].push(log)
    return groups
  }, {})

  const progressInsights: string[] = []

  Object.entries(exerciseGroups).forEach(([exercise, logs]) => {
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

function calculateWeightProgressions(workoutLogs: WorkoutLog[]) {
  const exerciseGroups = workoutLogs.reduce((groups: Record<string, WorkoutLog[]>, log: WorkoutLog) => {
    const exerciseName = log.custom_exercise || log.exercises?.name
    if (!exerciseName || !log.weight_kg) return groups
    
    if (!groups[exerciseName]) {
      groups[exerciseName] = []
    }
    groups[exerciseName].push(log)
    return groups
  }, {})

  const weightInsights: string[] = []

  Object.entries(exerciseGroups).forEach(([exercise, logs]) => {
    // Sort logs by date (oldest first)
    const sortedLogs = logs.sort((a, b) => 
      new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime()
    )
    
    if (sortedLogs.length >= 2) {
      const firstLog = sortedLogs[0]
      const lastLog = sortedLogs[sortedLogs.length - 1]
      
      if (firstLog.weight_kg && lastLog.weight_kg && lastLog.weight_kg > firstLog.weight_kg) {
        const weightIncrease = lastLog.weight_kg - firstLog.weight_kg
        const daysDifference = Math.ceil(
          (new Date(lastLog.workout_date).getTime() - new Date(firstLog.workout_date).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        
        if (daysDifference > 0) {
          const ratePerDay = weightIncrease / daysDifference
          const timeDescription = daysDifference > 30 
            ? `${Math.floor(daysDifference / 30)} months` 
            : `${daysDifference} days`
            
          weightInsights.push(
            `${exercise}: +${weightIncrease.toFixed(1)}kg over ${timeDescription} (${(ratePerDay * 30).toFixed(1)}kg/month rate)`
          )
        }
      }
    }
  })

  return weightInsights.length > 0 ? weightInsights : ['Keep logging workouts to track your weight progression!']
}
