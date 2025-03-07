
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";

  // Function to format message content with markdown-like syntax
  const formatContent = (content: string) => {
    // Replace ** for bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace * for italics
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Handle exercise names with sets/reps
    formatted = formatted.replace(
      /([A-Za-z\s]+):\s+(\d+)(?:-(\d+))?\s+sets\s+x\s+(\d+)(?:-(\d+))?\s+reps/g,
      '<strong>$1:</strong> $2$3 sets x $4$5 reps'
    );
    
    return formatted;
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 transition-opacity",
        isAssistant ? "" : "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8 mt-1">
        {isAssistant ? (
          <>
            <AvatarImage src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png" />
            <AvatarFallback className="bg-[#E22222]">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-[#333333]">
            <User className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div
        className={cn(
          "px-4 py-3 rounded-lg text-sm",
          isAssistant
            ? "bg-[#333333] text-white max-w-[80%]"
            : "bg-[#E22222] text-white self-end max-w-[80%]"
        )}
      >
        <div 
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          className="whitespace-pre-wrap"
        />
      </div>
    </div>
  );
};
