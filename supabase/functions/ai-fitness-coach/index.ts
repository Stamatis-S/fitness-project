
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    if (!CLAUDE_API_KEY) {
      console.error("CLAUDE_API_KEY is not set");
      
      // Return a friendly response instead of throwing an error
      return new Response(
        JSON.stringify({ 
          response: "I'm currently experiencing some technical difficulties. The AI service is temporarily unavailable. Please try again later or contact support if the issue persists."
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { userId, message, messageHistory, includeWorkoutData } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Prepare system prompt
    let systemPrompt = `You are GymCoach AI, a specialized fitness coach in a workout tracking app. 
    Your role is to help users with their fitness journey by providing personalized advice, workout plans, 
    and answering fitness-related questions. 
    
    Be concise, motivational, and specific in your responses.
    When creating workout plans, specify sets, reps, weights (if applicable), and rest periods.
    Your recommendations should follow scientific principles of training, including progressive overload, variety, and recovery.
    Always tailor advice based on the user's history and goals, and suggest realistic progressions.`;

    // Prepare messages array for Claude
    const messages = [
      { role: "assistant", content: systemPrompt },
    ];

    // If workout data is requested, fetch user's workout history
    if (includeWorkoutData) {
      console.log("Fetching workout data for user:", userId);
      
      // Fetch user profile info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('fitness_level, fitness_score')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profileData) {
        systemPrompt += `\n\nUser profile information:
        - Fitness level: ${profileData.fitness_level || 'Not specified'}
        - Fitness score: ${profileData.fitness_score || 'Not calculated'}`;
      }

      // Fetch recent workout logs
      const { data: workoutLogs, error: workoutError } = await supabase
        .from('workout_logs')
        .select(`
          workout_date, 
          category, 
          custom_exercise, 
          exercises(name), 
          set_number, 
          weight_kg, 
          reps
        `)
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })
        .limit(100);

      if (workoutError) {
        console.error("Error fetching workout logs:", workoutError);
      } else if (workoutLogs && workoutLogs.length > 0) {
        // Process workout data into useful summary
        const workoutsByCategory = workoutLogs.reduce((acc, log) => {
          const category = log.category;
          const exerciseName = log.custom_exercise || (log.exercises?.name) || 'Unknown exercise';
          
          if (!acc[category]) {
            acc[category] = {};
          }
          
          if (!acc[category][exerciseName]) {
            acc[category][exerciseName] = [];
          }
          
          acc[category][exerciseName].push({
            date: log.workout_date,
            weight: log.weight_kg,
            reps: log.reps,
            set: log.set_number
          });
          
          return acc;
        }, {});

        // Create a summary of the user's workout history
        let workoutSummary = "User's recent workout history:\n\n";
        
        Object.entries(workoutsByCategory).forEach(([category, exercises]: [string, any]) => {
          workoutSummary += `${category}:\n`;
          
          Object.entries(exercises).forEach(([exerciseName, sets]: [string, any]) => {
            // Sort sets by date (newest first)
            sets.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Get the most recent workout for this exercise
            const recentSets = sets.filter((set: any) => set.date === sets[0].date);
            
            workoutSummary += `- ${exerciseName}: Most recent (${sets[0].date}): `;
            
            recentSets.forEach((set: any, idx: number) => {
              workoutSummary += `${set.weight}kg × ${set.reps}${idx < recentSets.length - 1 ? ', ' : ''}`;
            });
            
            // Find max weight for this exercise
            const maxWeight = Math.max(...sets.map((set: any) => set.weight || 0));
            if (maxWeight > 0) {
              workoutSummary += ` (Max weight: ${maxWeight}kg)`;
            }
            
            workoutSummary += '\n';
          });
          
          workoutSummary += '\n';
        });
        
        // Add workout history to the system prompt
        systemPrompt += `\n\n${workoutSummary}`;
        
        // Update the system message with the enhanced prompt
        messages[0].content = systemPrompt;
      } else {
        systemPrompt += "\n\nThe user has no workout history yet.";
        messages[0].content = systemPrompt;
      }
    }

    // Add message history if provided
    if (messageHistory && messageHistory.length > 0) {
      messages.push(...messageHistory);
    }

    // Add the current user message
    messages.push({ role: "user", content: message });

    try {
      // Call Claude API
      console.log("Calling Claude API with messages:", JSON.stringify(messages));
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          messages: messages,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Claude API error:", error);
        
        // Return a user-friendly message for API errors
        return new Response(
          JSON.stringify({ 
            response: "I'm sorry, but I'm currently experiencing connection issues. Our AI service is temporarily unavailable. Please try again later or contact support if the issue persists." 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }

      const result = await response.json();
      const assistantMessage = result.content[0].text;

      // Save the chat history to the database - but don't throw an error if this fails
      try {
        const { error: chatError } = await supabase
          .from('assistant_chats')
          .insert([
            { 
              user_id: userId, 
              user_message: message, 
              assistant_message: assistantMessage,
              created_at: new Date().toISOString() 
            }
          ]);

        if (chatError) {
          console.error("Error saving chat history:", chatError);
        }
      } catch (dbError) {
        console.error("Database error when saving chat:", dbError);
        // Continue execution - don't let DB errors prevent returning the response
      }

      // Return the response
      return new Response(
        JSON.stringify({ 
          response: assistantMessage,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (apiError) {
      console.error("API call error:", apiError.message);
      
      // Return a fallback response for any API errors
      return new Response(
        JSON.stringify({ 
          response: "I apologize, but I'm currently experiencing technical difficulties. Please try again later. If you have specific workout questions, feel free to ask again in a moment." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ 
        response: "I encountered an unexpected error. Please try again or contact support if the issue persists." 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
});
