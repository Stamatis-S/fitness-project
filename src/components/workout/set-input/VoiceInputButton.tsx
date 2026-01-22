import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onResult: (value: number) => void;
  className?: string;
}

export function VoiceInputButton({ onResult, className }: VoiceInputButtonProps) {
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult,
    language: 'el-GR'
  });

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-11 w-10 min-w-10 rounded-xl border-border/30 transition-all shrink-0",
        isListening 
          ? "bg-destructive/20 border-destructive/50 animate-pulse" 
          : "bg-secondary/80 hover:bg-secondary active:scale-95",
        className
      )}
      onClick={handleClick}
    >
      {isListening ? (
        <MicOff className="h-4 w-4 text-destructive" />
      ) : (
        <Mic className="h-4 w-4 text-foreground" />
      )}
    </Button>
  );
}
