
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import { Send, Bot, Dumbbell, Lightbulb, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChatMessage } from "./types";
import { MessageBubble } from "./MessageBubble";

export function AIAssistant() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI fitness coach. How can I help with your workout planning today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
    }
  }, [session, navigate]);

  // Fetch the user's chat history
  const { data: chatHistory } = useQuery({
    queryKey: ["assistant_chats", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];

      const { data, error } = await supabase
        .from("assistant_chats")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Failed to load chat history");
        console.error("Error fetching chat history:", error);
        return [];
      }
      
      if (!data) return [];
      
      // Convert DB records to ChatMessage format
      return data.map((chat: any) => [
        {
          id: `user-${chat.id}`,
          role: "user" as const,
          content: chat.user_message,
          timestamp: chat.created_at,
        },
        {
          id: `assistant-${chat.id}`,
          role: "assistant" as const,
          content: chat.assistant_message,
          timestamp: chat.created_at,
        },
      ]).flat();
    },
    enabled: !!session?.user.id,
  });

  // Update messages when chat history is loaded
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages([messages[0], ...chatHistory]);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Adjust textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !session?.user.id) return;

    try {
      setIsLoading(true);
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");

      // Prepare message history for the API
      const messageHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .slice(-10) // Only send the last 10 messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call the AI Fitness Coach edge function
      const response = await supabase.functions.invoke('ai-fitness-coach', {
        body: {
          userId: session.user.id,
          message: newMessage,
          messageHistory,
          includeWorkoutData: true, // Include workout data for personalized responses
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get response from assistant");
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save the conversation to the database
      const { error: saveError } = await supabase
        .from("assistant_chats")
        .insert({
          user_id: session.user.id,
          user_message: newMessage,
          assistant_message: response.data.response,
        });

      if (saveError) {
        console.error("Error saving chat:", saveError);
        toast.error("Failed to save conversation");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response from assistant");
      
      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderSuggestions = () => {
    const suggestions = [
      {
        icon: <Dumbbell className="w-4 h-4 mr-2" />,
        text: "Create a weekly workout plan based on my history",
      },
      {
        icon: <Lightbulb className="w-4 h-4 mr-2" />,
        text: "How can I improve my bench press technique?",
      },
    ];

    return (
      <div className="flex flex-col gap-2 mt-4">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start text-left text-xs h-auto py-2 px-3 bg-[#333333] hover:bg-[#444444] text-white border-[#444444]"
            onClick={() => {
              setNewMessage(suggestion.text);
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
          >
            {suggestion.icon}
            <span>{suggestion.text}</span>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pb-16">
        <div className="mx-auto max-w-[98%]">
          <div className="flex items-center p-2">
            <button
              className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-2 rounded"
              onClick={() => navigate("/dashboard")}
            >
              <span className="text-sm">← Back</span>
            </button>
            <h1 className="text-lg font-bold flex-1 text-center text-white">
              AI Fitness Coach
            </h1>
            <div className="w-[60px]" />
          </div>

          <Card className="overflow-hidden border-0 bg-[#222222] h-[calc(100vh-150px)] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#333333] max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png" />
                      <AvatarFallback className="bg-[#E22222]">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {messages.length === 1 && renderSuggestions()}
            </ScrollArea>

            <div className="p-3 border-t border-[#333333] bg-[#1e1e1e]">
              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "resize-none min-h-[40px] max-h-[150px] bg-[#333333] border-[#444444] text-white",
                    isLoading && "opacity-50 pointer-events-none"
                  )}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="h-10 w-10 p-2 rounded-full bg-[#E22222] hover:bg-[#C11818] text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
